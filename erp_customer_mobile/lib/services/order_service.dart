import 'package:flutter/foundation.dart';
import '../models/order.dart';
import '../models/request_parms.dart';
import 'api_client.dart';

class OrderService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Order>> getMyOrders(int customerId) async {
    try {
      final response = await _apiClient.post('/CustomerOrder/getMyOrders', RequestParms(
        user: customerId,
        completedYn: '', // Fetch both completed and active orders
      ).toJson());
      final List<dynamic> data = _apiClient.processResponse(response);
      return data.map((json) => Order.fromJson(json)).toList();
    } catch (e) {
      debugPrint('OrderService Error: $e');
      return [];
    }
  }

  Future<dynamic> cancelOrder(int orderId) async {
    try {
      final response = await _apiClient.post(
        '/CustomerOrder/cancelCustomerOrder',
        {'id': orderId},
      );
      return _apiClient.processResponse(response);
    } catch (e) {
      return null;
    }
  }
}
