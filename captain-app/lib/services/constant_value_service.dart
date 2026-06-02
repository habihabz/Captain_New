import '../models/constant_value.dart';
import '../models/request_parms.dart';
import 'api_client.dart';

class ConstantValueService {
  final ApiClient _apiClient = ApiClient();

  Future<List<ConstantValue>> getConstantValues() async {
    try {
      final response = await _apiClient.post('/ConstantValue/getConstantValues', {});
      final List<dynamic> data = _apiClient.processResponse(response);
      return data.map((json) => ConstantValue.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<ConstantValue?> getConstantValueByName(String name) async {
    try {
      final response = await _apiClient.post('/ConstantValue/getConstantValueByName', RequestParms(name: name).toJson());
      final json = _apiClient.processResponse(response);
      if (json == null) return null;
      return ConstantValue.fromJson(json);
    } catch (e) {
      return null;
    }
  }
}
