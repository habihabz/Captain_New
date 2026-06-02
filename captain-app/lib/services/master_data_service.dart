import '../models/master_data.dart';
import 'api_client.dart';

class MasterDataService {
  final ApiClient _apiClient = ApiClient();

  Future<int> getCountryIdByName(String name) async {
    try {
      final response = await _apiClient.post('/MasterData/getCountry', {
        'name': name,
      });
      final data = _apiClient.processResponse(response);
      return data['md_id'] ?? 0;
    } catch (e) {
      return 0;
    }
  }

  Future<List<MasterData>> getMasterDatasByType(String type) async {
    try {
      final response = await _apiClient.post('/MasterData/getMasterDatasByType', {
        'type': type,
      });
      final List<dynamic> data = _apiClient.processResponse(response);
      return data.map((json) => MasterData.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }
}
