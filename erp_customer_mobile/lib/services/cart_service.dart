import '../models/request_parms.dart';
import '../models/cart.dart';
import '../models/db_result.dart';
import 'api_client.dart';

class CartService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Cart>> getCarts(int customerId, int countryId) async {
    try {
      final response = await _apiClient.post('/Cart/getCarts', RequestParms(
        user: customerId,
        country: countryId,
      ).toJson());
      final List<dynamic> data = _apiClient.processResponse(response);
      return data.map((json) => Cart.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<DbResult> addOrUpdateCart(Cart cart) async {
    try {
      final response = await _apiClient.post(
        '/Cart/createOrUpdateCart',
        cart.toJson(),
      );
      final data = _apiClient.processResponse(response);
      return DbResult.fromJson(data);
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    }
  }

  Future<DbResult> deleteCart(int cartId) async {
    try {
      final response = await _apiClient.post('/Cart/deleteCart', cartId);
      final data = _apiClient.processResponse(response);
      return DbResult.fromJson(data);
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    }
  }
}
