import '../models/order_movement_history.dart';
import 'api_client.dart';

class OrderMovementHistoryService {
  final ApiClient _apiClient = ApiClient();

  Future<List<OrderMovementHistory>> getOrderMovementHistoriesByOrder(int orderId) async {
    try {
      final response = await _apiClient.post('/OrderMovementHistory/getOrderMovementHistoriesByOrder', orderId);
      final List<dynamic> data = _apiClient.processResponse(response);
      return data.map((json) => OrderMovementHistory.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }
}
