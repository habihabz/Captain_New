import 'package:flutter/material.dart';
import '../models/order.dart';
import '../services/order_service.dart';

class OrderProvider with ChangeNotifier {
  final OrderService _orderService = OrderService();
  List<Order> _orders = [];
  bool _isLoading = false;

  List<Order> get orders => _orders;
  bool get isLoading => _isLoading;

  Future<void> fetchOrders(int customerId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _orders = await _orderService.getMyOrders(customerId);
    } catch (e) {
      debugPrint('Error fetching orders: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> cancelOrder(int orderId, int customerId) async {
    final result = await _orderService.cancelOrder(orderId);
    if (result != null && result['status'] == true) {
      await fetchOrders(customerId);
      return true;
    }
    return false;
  }
}
