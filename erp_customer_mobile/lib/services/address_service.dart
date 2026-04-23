import '../models/address.dart';
import '../models/db_result.dart';
import '../models/request_parms.dart';
import 'api_client.dart';

class AddressService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Address>> getMyAddresses(int customerId) async {
    try {
      final response = await _apiClient.post('/Address/getMyAddresses', RequestParms(id: customerId).toJson());
      final List<dynamic> data = _apiClient.processResponse(response);
      return data.map((json) => Address.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<DbResult> createOrUpdateAddress(Address address) async {
    try {
      final response = await _apiClient.post('/Address/createOrUpdateAddress', address.toJson());
      final data = _apiClient.processResponse(response);
      return DbResult.fromJson(data);
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    }
  }
}
