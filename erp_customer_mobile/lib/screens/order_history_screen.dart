import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
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
        Provider.of<OrderProvider>(context, listen: false).fetchOrders(auth.customer!.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('My Orders', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          final auth = Provider.of<AuthProvider>(context, listen: false);
          if (auth.isAuthenticated) {
            await orderProvider.fetchOrders(auth.customer!.id);
          }
        },
        child: orderProvider.isLoading 
            ? const Center(child: CircularProgressIndicator())
            : orderProvider.orders.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    itemCount: orderProvider.orders.length,
                    itemBuilder: (context, index) {
                      final order = orderProvider.orders[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.grey[100]!),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Order #${order.id}',
                                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      DateFormat('dd MMM yyyy, hh:mm a').format(order.creDate),
                                      style: GoogleFonts.inter(color: Colors.grey[400], fontSize: 12),
                                    ),
                                  ],
                                ),
                                _statusChip(order.statusName),
                              ],
                            ),
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 16.0),
                              child: Divider(height: 1, thickness: 0.5),
                            ),
                            Row(
                              children: [
                                Container(
                                  width: 50,
                                  height: 50,
                                  decoration: BoxDecoration(
                                    color: AppConstants.primaryColor.withOpacity(0.05),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(Icons.inventory_2_outlined, color: AppConstants.primaryColor),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        order.productName,
                                        style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 14),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      Text(
                                        'Quantity: ${order.qty}',
                                        style: GoogleFonts.inter(color: Colors.grey[500], fontSize: 13),
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  '₹${order.netAmount.toStringAsFixed(2)}',
                                  style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 18),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.assignment_outlined, size: 70, color: Colors.grey[200]),
          const SizedBox(height: 20),
          Text(
            'No orders yet',
            style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.grey[400]),
          ),
          const SizedBox(height: 8),
          Text(
            'Your shopping journey starts here!',
            style: GoogleFonts.inter(color: Colors.grey[400], fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _statusChip(String status) {
    final color = _getStatusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Text(
        status,
        style: GoogleFonts.inter(color: color, fontWeight: FontWeight.bold, fontSize: 11),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'delivered': return Colors.green;
      case 'canceled': return Colors.red;
      case 'pending': return Colors.orange;
      case 'verified': return Colors.blue;
      case 'shipped': return Colors.purple;
      default: return AppConstants.primaryColor;
    }
  }
}
