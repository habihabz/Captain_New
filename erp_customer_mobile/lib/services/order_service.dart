import 'package:flutter/foundation.dart';
import '../models/order.dart';
import '../models/db_result.dart';
import '../models/request_parms.dart';
import 'api_client.dart';
import '../utils/constants.dart';

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

  Future<Order?> getCustomerOrder(int orderId) async {
    try {
      final response = await _apiClient.post('/CustomerOrder/getCustomerOrder', orderId);
      final json = _apiClient.processResponse(response);
      return Order.fromJson(json);
    } catch (e) {
      debugPrint('OrderService Error: $e');
      return null;
    }
  }

  Future<DbResult> createOrUpdateCustomerOrder(RequestParms params) async {
    try {
      final response = await _apiClient.post(
        '/CustomerOrder/createOrUpdateCustomerOrder',
        params.toJson(),
      );
      final json = _apiClient.processResponse(response);
      return DbResult.fromJson(json);
    } catch (e) {
      return DbResult(status: false, message: e.toString());
    }
  }

  Future<DbResult> cancelOrder(int orderId) async {
    try {
      final response = await _apiClient.post(
        '/CustomerOrder/cancelCustomerOrder',
        RequestParms(id: orderId).toJson(),
      );
      final json = _apiClient.processResponse(response);
      return DbResult.fromJson(json);
    } catch (e) {
      return DbResult(status: false, message: e.toString());
    }
  }

  Future<DbResult> returnOrder(int orderId, String reason, int customerId) async {
    try {
      final response = await _apiClient.post(
        '/ReturnOrder/raiseReturnRequest',
        {
          'ro_order_no': orderId,
          'ro_reason': reason,
          'ro_cre_by': customerId,
        },
      );
      final json = _apiClient.processResponse(response);
      return DbResult.fromJson(json);
    } catch (e) {
      return DbResult(status: false, message: e.toString());
    }
  }

  String getInvoiceUrl(int orderId) {
    return '${AppConstants.baseUrl}/api/CustomerOrder/invoice/$orderId';
  }
}
