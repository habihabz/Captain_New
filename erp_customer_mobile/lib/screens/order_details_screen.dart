import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/order.dart';
import '../models/order_movement_history.dart';
import '../services/order_service.dart';
import '../services/order_movement_history_service.dart';
import '../services/product_service.dart';
import '../utils/constants.dart';
import 'dart:convert' as convert;
import '../providers/auth_provider.dart';
import '../providers/order_provider.dart';
import '../providers/product_provider.dart';
import 'product_details_screen.dart';
import 'package:url_launcher/url_launcher.dart';

class OrderDetailsScreen extends StatefulWidget {
  final int orderId;
  const OrderDetailsScreen({super.key, required this.orderId});

  @override
  State<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends State<OrderDetailsScreen> {
  final OrderService _orderService = OrderService();
  final OrderMovementHistoryService _historyService =
      OrderMovementHistoryService();
  final ProductService _productService = ProductService();

  Order? _order;
  List<OrderMovementHistory> _history = [];
  bool _isLoading = true;
  String _resolvedImageUrl = '';

  @override
  void initState() {
    super.initState();
    _fetchDetails();
  }

  Future<void> _fetchDetails() async {
    setState(() => _isLoading = true);
    try {
      final order = await _orderService.getCustomerOrder(widget.orderId);
      if (order != null) {
        _order = order;
        _history = await _historyService.getOrderMovementHistoriesByOrder(
          widget.orderId,
        );
        await _resolveImage();
      }
    } catch (e) {
      debugPrint('Error fetching order details: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _resolveImage() async {
    if (_order == null) return;

    // 1. Try from attachments
    if (_order!.p_attachements != null && _order!.p_attachements!.isNotEmpty) {
      _resolvedImageUrl = _parseImageUrl(
        _order!.p_attachements!,
        _order!.co_color,
      );
      if (_resolvedImageUrl.isNotEmpty) return;
    }

    // 2. Fetch from service if missing
    if (_order!.co_product != null) {
      final attachments = await _productService.getProductAttachmentsByColor(
        _order!.co_product!,
        _order!.co_color ?? 0,
      );
      if (attachments.isNotEmpty) {
        final match = attachments.firstWhere(
          (a) => a.colorId == _order!.co_color,
          orElse: () => attachments[0],
        );
        String path = match.imagePath;
        if (path.isNotEmpty) {
          _resolvedImageUrl = path.startsWith('http')
              ? path
              : '${AppConstants.baseUrl}/${path.startsWith('/') ? path.substring(1) : path}';
        }
      }
    }
  }

  String _parseImageUrl(String jsonData, int? colorId) {
    try {
      final List<dynamic> attachments = convert.json.decode(jsonData);
      if (attachments.isEmpty) return '';
      final match = attachments.firstWhere(
        (a) => a['pa_color'] == colorId,
        orElse: () => attachments[0],
      );
      String path = match['pa_image_path'] ?? '';
      return path.startsWith('http')
          ? path
          : '${AppConstants.baseUrl}/${path.startsWith('/') ? path.substring(1) : path}';
    } catch (e) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        title: Text(
          'Order Details',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.black))
          : _order == null
          ? _buildErrorState()
          : SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Column(
                children: [
                  _buildProductCard(),
                  _buildOrderInfo(),
                  _buildPriceSummary(),
                  _buildSectionTitle('Movement History'),
                  _buildTimeline(),
                  const SizedBox(height: 120),
                ],
              ),
            ),
      bottomSheet: _order != null ? _buildActionButtons() : null,
    );
  }

  Widget _buildProductCard() {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: _resolvedImageUrl.isNotEmpty
                  ? Image.network(_resolvedImageUrl, fit: BoxFit.cover)
                  : const Icon(
                      Icons.inventory_2_outlined,
                      color: Colors.grey,
                      size: 30,
                    ),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _order!.co_product_name,
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Size: ${_order!.co_size_name ?? 'Standard'} • Qty: ${_order!.co_qty}',
                  style: GoogleFonts.inter(
                    color: Colors.grey[500],
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  '₹${_order!.co_net_amount.toStringAsFixed(2)}',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                    color: Colors.black,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderInfo() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _infoRow(
            'Order Date',
            DateFormat('dd MMM yyyy, hh:mm a').format(_order!.co_cre_date),
          ),
          _infoRow('Order ID', '#${_order!.co_id}'),
          _infoRow(
            'Payment Ref',
            _order!.co_payment_id.isEmpty ? 'Pending' : _order!.co_payment_id,
          ),
          const SizedBox(height: 10),
          const Divider(color: Color(0xFFF1F5F9)),
          const SizedBox(height: 10),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              color: Colors.grey[500],
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: GoogleFonts.inter(
              color: Colors.black,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeline() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 25),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_history.isEmpty)
            Text(
              'No activity recorded yet.',
              style: GoogleFonts.inter(color: Colors.grey[400], fontSize: 13),
            )
          else
            ...List.generate(
              _history.length,
              (index) => _buildTimelineItem(
                _history[index],
                index == _history.length - 1,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(OrderMovementHistory item, bool isLast) {
    return IntrinsicHeight(
      child: Row(
        children: [
          Column(
            children: [
              Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  color: isLast ? AppConstants.primaryColor : Colors.grey[300],
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                  boxShadow: [
                    if (isLast)
                      BoxShadow(
                        color: AppConstants.primaryColor.withValues(alpha: 0.3),
                        blurRadius: 8,
                      ),
                  ],
                ),
              ),
              if (!isLast)
                Expanded(child: Container(width: 2, color: Colors.grey[200])),
            ],
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 25),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.omh_status_name ?? 'Update',
                    style: GoogleFonts.outfit(
                      fontWeight: isLast ? FontWeight.w800 : FontWeight.w600,
                      fontSize: 14,
                      color: isLast ? Colors.black : Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.omh_cre_date != null
                        ? DateFormat(
                            'dd MMM, hh:mm a',
                          ).format(item.omh_cre_date!)
                        : '',
                    style: GoogleFonts.inter(
                      color: Colors.grey[400],
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  void _handleCancelOrder() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final orderProvider = Provider.of<OrderProvider>(context, listen: false);

    bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Cancel Order', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        content: const Text('Are you sure you want to cancel this order? This action cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text('No', style: GoogleFonts.inter(color: Colors.grey))),
          TextButton(onPressed: () => Navigator.pop(context, true), child: Text('Yes, Cancel', style: GoogleFonts.inter(color: Colors.red, fontWeight: FontWeight.bold))),
        ],
      ),
    );

    if (confirm == true) {
      setState(() => _isLoading = true);
      final success = await orderProvider.cancelOrder(widget.orderId, auth.customer!.u_id);
      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order canceled successfully')));
          _fetchDetails(); // Refresh details
        } else {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to cancel order. Please try again.')));
        }
      }
    }
  }

  void _handleReturnOrder() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final orderProvider = Provider.of<OrderProvider>(context, listen: false);
    final TextEditingController reasonController = TextEditingController();

    bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Return Order', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Please provide a reason for returning this order:'),
            const SizedBox(height: 15),
            TextField(
              controller: reasonController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Reason for return...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: const Color(0xFFF1F5F9),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text('Cancel', style: GoogleFonts.inter(color: Colors.grey))),
          TextButton(
            onPressed: () {
              if (reasonController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter a reason')));
                return;
              }
              Navigator.pop(context, true);
            }, 
            child: Text('Submit Return', style: GoogleFonts.inter(color: Colors.orange[800], fontWeight: FontWeight.bold))
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() => _isLoading = true);
      final success = await orderProvider.returnOrder(widget.orderId, reasonController.text.trim(), auth.customer!.u_id);
      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Return request submitted successfully')));
          _fetchDetails(); // Refresh details
        } else {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to submit return request. Please try again.')));
        }
      }
    }
  }

  Future<void> _handleDownloadInvoice() async {
    if (_order == null) return;
    final url = Uri.parse(_orderService.getInvoiceUrl(_order!.co_id));
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open invoice download link')),
        );
      }
    }
  }

  Widget _buildActionButtons() {
    final bool canCancel = _isCancelable(_order?.co_status_name ?? '');
    final bool canReturn = _order?.co_status_name.toLowerCase() == 'delivered' && _order?.co_is_canceled != 'Y';
    final bool isDelivered = _order?.co_status_name.toLowerCase() == 'delivered';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isDelivered) ...[
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _handleDownloadInvoice,
                  icon: const Icon(Icons.download_rounded, size: 20, color: Colors.blue),
                  label: Text(
                    'Download Invoice',
                    style: GoogleFonts.outfit(color: Colors.blue[700], fontWeight: FontWeight.bold),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: Colors.blue[100]!),
                    backgroundColor: Colors.blue.withValues(alpha: 0.05),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
            Row(
              children: [
                if (canCancel)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _handleCancelOrder,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFFF1F5F9)),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: Text(
                        'Cancel Order',
                        style: GoogleFonts.outfit(
                          color: Colors.red[400],
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                if (canReturn)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _handleReturnOrder,
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.orange[200]!),
                        backgroundColor: Colors.orange.withValues(alpha: 0.05),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: Text(
                        'Return Order',
                        style: GoogleFonts.outfit(
                          color: Colors.orange[800],
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                if (canCancel || canReturn) const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : () async {
                      if (_order?.co_product == null) return;
                      
                      // Fetch the full product object to navigate to details
                      setState(() => _isLoading = true);
                      final productProvider = Provider.of<ProductProvider>(context, listen: false);
                      final product = await _productService.getProductByCountry(
                        _order!.co_product!, 
                        productProvider.selectedCountryId
                      );
                      
                      if (mounted) {
                        setState(() => _isLoading = false);
                        if (product != null) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ProductDetailsScreen(product: product),
                            ),
                          );
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Failed to load product details'))
                          );
                        }
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                    ),
                    child: _isLoading 
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text(
                            'Buy Again',
                            style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  bool _isCancelable(String status) {
    if (_order?.co_is_canceled == 'Y') return false;
    final s = status.toLowerCase();
    // Only allow cancellation if order is Pending, Confirmed or Verified.
    // Restriction: Once Shipped or Delivered, it cannot be canceled.
    return s == 'pending' || s == 'order confirmed' || s == 'verified';
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 60, color: Colors.grey),
          const SizedBox(height: 20),
          Text(
            'Could not load order details',
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          TextButton(onPressed: _fetchDetails, child: const Text('Try Again')),
        ],
      ),
    );
  }

  Widget _buildPriceSummary() {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Price Summary',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 17),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: _order!.co_is_returned == 'Y'
                      ? Colors.orange
                      : (_order!.co_is_canceled == 'Y' || _order!.co_status_name.toLowerCase().contains('cancel'))
                          ? Colors.red
                          : _getStatusColor(_order!.co_status_name).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    if (_order!.co_is_returned == 'Y' || _order!.co_is_canceled == 'Y' || _order!.co_status_name.toLowerCase().contains('cancel'))
                      BoxShadow(
                        color: (_order!.co_is_returned == 'Y' ? Colors.orange : Colors.red).withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      )
                  ],
                ),
                child: Text(
                  _order!.co_is_returned == 'Y'
                      ? 'RETURNED'
                      : (_order!.co_is_canceled == 'Y' || _order!.co_status_name.toLowerCase().contains('cancel'))
                          ? 'CANCELLED'
                          : _order!.co_status_name.toUpperCase(),
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w900,
                    fontSize: 10,
                    color: (_order!.co_is_returned == 'Y' || _order!.co_is_canceled == 'Y' || _order!.co_status_name.toLowerCase().contains('cancel'))
                        ? Colors.white
                        : _getStatusColor(_order!.co_status_name),
                    letterSpacing: 1,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _priceRow('Subtotal', '₹${_order!.co_amount.toStringAsFixed(2)}'),
          if (_order!.co_discount_amount > 0)
            Column(
              children: [
                _priceRow(
                  'Discount ${_order!.co_discount_perc > 0 ? '(${_order!.co_discount_perc.toStringAsFixed(0)}%)' : ''}', 
                  '-₹${_order!.co_discount_amount.toStringAsFixed(2)}', 
                  isDiscount: true
                ),
                if (_order!.co_promo_code != null && _order!.co_promo_code!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Promo Code Applied',
                          style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w400),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.green.withValues(alpha: 0.2)),
                          ),
                          child: Text(
                            _order!.co_promo_code!,
                            style: GoogleFonts.inter(
                              color: Colors.green[700],
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          _priceRow('GST (Calculated)', '₹${_order!.co_gst_amount.toStringAsFixed(2)}'),
          _priceRow('Delivery Fee', _order!.co_delivery_charge > 0 ? '₹${_order!.co_delivery_charge.toStringAsFixed(2)}' : 'FREE'),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Divider(height: 1, thickness: 1, color: Color(0xFFF1F5F9)),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Amount',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 18),
              ),
              Text(
                '₹${_order!.co_net_amount.toStringAsFixed(2)}',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 22, color: Colors.black),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _priceRow(String label, String value, {bool isDiscount = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 14, fontWeight: FontWeight.w500),
          ),
          Text(
            value,
            style: GoogleFonts.inter(
              color: isDiscount ? Colors.green : const Color(0xFF1E293B),
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    status = status.toLowerCase();
    if (status.contains('confirm')) return Colors.green;
    if (status.contains('ship') || status.contains('deliver') || status.contains('verif')) return Colors.blue;
    if (status.contains('return')) return Colors.orange;
    if (status.contains('cancel')) return Colors.red;
    if (status.contains('refund')) return Colors.orange;
    return Colors.black;
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(25, 8, 20, 16),
      child: Row(
        children: [
          Text(
            title,
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.w800,
              fontSize: 16,
              color: const Color(0xFF1E293B),
            ),
          ),
        ],
      ),
    );
  }
}
