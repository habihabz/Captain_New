import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert' as convert;
import '../models/order.dart';
import '../providers/auth_provider.dart';
import '../providers/order_provider.dart';
import '../utils/constants.dart';

class MyOrdersScreen extends StatefulWidget {
  const MyOrdersScreen({super.key});

  @override
  State<MyOrdersScreen> createState() => _MyOrdersScreenState();
}

class _MyOrdersScreenState extends State<MyOrdersScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.isAuthenticated) {
        Provider.of<OrderProvider>(context, listen: false).fetchOrders(auth.customer!.u_id);
      }
    });
  }

  String _resolveImageUrl(String? attachmentsJson, int? colorId) {
    if (attachmentsJson == null || attachmentsJson.isEmpty) return '';
    try {
      final List<dynamic> attachments = convert.json.decode(attachmentsJson);
      if (attachments.isEmpty) return '';
      
      // Match by color if available
      if (colorId != null && colorId != 0) {
        final match = attachments.firstWhere(
          (a) => a['pa_color'] == colorId,
          orElse: () => null,
        );
        if (match != null) return _formatUrl(match['pa_image_path']);
      }
      
      // Fallback to shared image
      final shared = attachments.firstWhere(
        (a) => a['pa_color'] == 0 || a['pa_color'] == null,
        orElse: () => attachments[0],
      );
      return _formatUrl(shared['pa_image_path']);
    } catch (e) {
      return '';
    }
  }

  String _formatUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    String cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return '${AppConstants.baseUrl}/$cleanPath';
  }

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context);
    final auth = Provider.of<AuthProvider>(context, listen: false);

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8F9FA), // Slightly softer background
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(170),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: SafeArea(
              child: Column(
                children: [
                  // Custom App Bar Row
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.arrow_back_ios_new, size: 20, color: Colors.black),
                          onPressed: () => Navigator.pop(context),
                        ),
                        Text(
                          'My Orders',
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w800,
                            fontSize: 20,
                            letterSpacing: -0.8,
                            color: Colors.black,
                          ),
                        ),
                        const SizedBox(width: 48), // Balancing spacer for centered title
                      ],
                    ),
                  ),
                  const SizedBox(height: 5),
                  // Premium Segmented TabBar
                  Container(
                    margin: const EdgeInsets.fromLTRB(20, 10, 20, 20), // More margin
                    padding: const EdgeInsets.all(5),
                    height: 52, // Explicit height for better control
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9), 
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: TabBar(
                      indicatorSize: TabBarIndicatorSize.tab,
                      indicator: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      labelColor: Colors.black,
                      unselectedLabelColor: const Color(0xFF94A3B8),
                      labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 13),
                      unselectedLabelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 13),
                      dividerColor: Colors.transparent,
                      tabs: const [
                        Tab(text: 'Ongoing'),
                        Tab(text: 'Delivered'),
                        Tab(text: 'Canceled'),
                        Tab(text: 'Returned'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        body: orderProvider.isLoading 
            ? const Center(child: CircularProgressIndicator(color: Colors.black))
            : TabBarView(
                children: [
                  _buildTabBody(
                    orderProvider.orders.where((o) => _isOngoing(o)).toList(),
                    orderProvider,
                    'No active orders',
                    () => orderProvider.fetchOrders(auth.customer!.u_id),
                  ),
                  _buildTabBody(
                    orderProvider.orders.where((o) => o.co_status_name.toLowerCase() == 'delivered').toList(),
                    orderProvider,
                    'No delivered orders',
                    () => orderProvider.fetchOrders(auth.customer!.u_id),
                  ),
                  _buildTabBody(
                    orderProvider.orders.where((o) => o.co_is_canceled == 'Y').toList(),
                    orderProvider,
                    'No canceled orders',
                    () => orderProvider.fetchOrders(auth.customer!.u_id),
                  ),
                  _buildTabBody(
                    orderProvider.orders.where((o) => o.co_is_returned == 'Y').toList(),
                    orderProvider,
                    'No returned orders',
                    () => orderProvider.fetchOrders(auth.customer!.u_id),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildTabBody(List<Order> orders, OrderProvider provider, String emptyMsg, Future<void> Function() onRefresh) {
    return RefreshIndicator(
      color: AppConstants.primaryColor,
      onRefresh: onRefresh,
      child: _buildOrderList(orders, provider, emptyMsg),
    );
  }


  bool _isOngoing(Order order) {
    if (order.co_is_canceled == 'Y' || order.co_is_returned == 'Y') return false;
    final s = order.co_status_name.toLowerCase();
    return s != 'delivered' && s.isNotEmpty;
  }


  Widget _buildOrderList(List<Order> filteredOrders, OrderProvider orderProvider, String emptyMsg) {
    if (filteredOrders.isEmpty) {
      return _buildEmptyState(emptyMsg);
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      itemCount: filteredOrders.length,
      itemBuilder: (context, index) {
        final order = filteredOrders[index];
        String imageUrl = orderProvider.getOrderImage(order.co_id);
        if (imageUrl.isEmpty) {
          imageUrl = _resolveImageUrl(order.p_attachements, order.co_color);
        }
        
        return GestureDetector(
          onTap: () => Navigator.pushNamed(context, '/order-details', arguments: order.co_id),
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 15),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Order #${order.co_id}',
                            style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 16, letterSpacing: -0.2),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            DateFormat('dd MMMM yyyy, hh:mm a').format(order.co_cre_date),
                            style: GoogleFonts.inter(color: const Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                      _buildStatusBadge(order),
                    ],
                  ),
                ),
                const Divider(height: 1, thickness: 1, color: Color(0xFFF1F5F9)),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      Container(
                        width: 70,
                        height: 70,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFF1F5F9)),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: imageUrl.isNotEmpty
                              ? Image.network(imageUrl, fit: BoxFit.cover, errorBuilder: (context, error, stackTrace) => const Icon(Icons.inventory_2_outlined, color: Color(0xFF64748B)))
                              : const Icon(Icons.inventory_2_outlined, color: Color(0xFF64748B)),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              order.co_product_name,
                              style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13, color: const Color(0xFF1E293B)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Qty: ${order.co_qty} • ${order.co_size_name ?? 'Standard'}${order.co_color_name != null ? ' • ${order.co_color_name}' : ''}',
                              style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w500),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '₹${order.co_net_amount.toStringAsFixed(2)}',
                              style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 17, color: Colors.black),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios, size: 14, color: Color(0xFFCBD5E1)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }


  Widget _buildEmptyState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(30),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.shopping_bag_outlined, size: 60, color: const Color(0xFFCBD5E1)),
          ),
          const SizedBox(height: 24),
          Text(
            message,
            style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w800, color: const Color(0xFF1E293B)),
          ),
          const SizedBox(height: 8),
          const SizedBox(height: 32),
          SizedBox(
            width: 200,
            child: ElevatedButton(
              onPressed: () => Navigator.pushReplacementNamed(context, '/home'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              child: Text(
                'Shop Now',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 15),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(Order order) {
    String status = order.co_status_name;
    if (order.co_is_returned == 'Y') {
      status = 'Returned';
    } else if (order.co_is_canceled == 'Y') {
      status = 'Canceled';
    }
    
    status = status.isEmpty ? 'Pending' : status;
    final color = _getStatusColor(status);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.12)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 8),
          Text(
            status.toUpperCase(),
            style: GoogleFonts.inter(color: color, fontWeight: FontWeight.w800, fontSize: 9, letterSpacing: 0.5),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'delivered': return const Color(0xFF10B981); // Emerald
      case 'canceled': return const Color(0xFFEF4444); // Red
      case 'returned': return const Color(0xFFF59E0B); // Amber/Orange to match detail screen
      case 'pending': return const Color(0xFFF59E0B); // Amber
      case 'verified': return const Color(0xFF3B82F6); // Blue
      case 'shipped': return const Color(0xFF8B5CF6); // Violet
      case 'order confirmed': return const Color(0xFF6366F1); // Indigo
      default: return const Color(0xFF64748B); // Slate
    }
  }
}
