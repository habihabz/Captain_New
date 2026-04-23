import 'package:flutter/material.dart';
import '../models/order.dart';
import '../services/order_service.dart';
import '../services/product_service.dart';
import '../utils/constants.dart';

class OrderProvider with ChangeNotifier {
  final OrderService _orderService = OrderService();
  final ProductService _productService = ProductService();
  List<Order> _orders = [];
  bool _isLoading = false;
  Map<int, String> _orderImages = {}; // co_id -> imageUrl

  List<Order> get orders => _orders;
  bool get isLoading => _isLoading;

  String getOrderImage(int orderId) => _orderImages[orderId] ?? '';

  Future<void> fetchOrders(int customerId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _orders = await _orderService.getMyOrders(customerId);
      
      // Fetch missing images similar to Angular implementation
      for (var order in _orders) {
        if (!_orderImages.containsKey(order.co_id)) {
           _resolveImage(order);
        }
      }
    } catch (e) {
      debugPrint('Error fetching orders: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _resolveImage(Order order) async {
    // 1. Try from order p_attachements if present
    if (order.p_attachements != null && order.p_attachements!.isNotEmpty) {
      // Logic handled in UI or here? Let's keep it in a central place.
      // For now, let's just use the service to match Angular 1:1
    }

    if (order.co_product != null) {
      final attachments = await _productService.getProductAttachmentsByColor(order.co_product!, order.co_color ?? 0);
      if (attachments.isNotEmpty) {
         // Logic to find best match
         final match = attachments.firstWhere(
           (a) => a.colorId == order.co_color,
           orElse: () => attachments[0],
         );
         
         String path = match.imagePath;
         if (path.isNotEmpty) {

            String fullUrl = '';
            if (path.startsWith('http')) {
               fullUrl = path;
            } else {
               String cleanPath = path.startsWith('/') ? path.substring(1) : path;
               fullUrl = '${AppConstants.baseUrl}/$cleanPath';
            }
            _orderImages[order.co_id] = fullUrl;
            notifyListeners();
         }
      }
    }
  }

  Future<bool> cancelOrder(int orderId, int customerId) async {
    final result = await _orderService.cancelOrder(orderId);
    if (result.status) {
      await fetchOrders(customerId);
      return true;
    }
    return false;
  }

  Future<bool> returnOrder(int orderId, String reason, int customerId) async {
    final result = await _orderService.returnOrder(orderId, reason, customerId);
    if (result.status) {
      await fetchOrders(customerId);
      return true;
    }
    return false;
  }
}
