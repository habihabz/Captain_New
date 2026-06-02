import '../models/favourite.dart';
import '../models/db_result.dart';
import '../models/request_parms.dart';
import 'api_client.dart';

class FavouriteService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Favourite>> getFavourites(int customerId) async {
    try {
      final response = await _apiClient.post('/Favourite/getFavourites', RequestParms(
        user: customerId,
      ).toJson());
      final List<dynamic> data = _apiClient.processResponse(response);
      return data.map((json) => Favourite.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<DbResult> toggleFavourite(Favourite favourite) async {
    try {
      final response = await _apiClient.post(
        '/Favourite/createOrUpdateFavourite',
        favourite.toJson(),
      );
      final data = _apiClient.processResponse(response);
      return DbResult.fromJson(data);
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    }
  }

  Future<DbResult> deleteFavourite(int id) async {
    try {
      final response = await _apiClient.post('/Favourite/deleteFavourite', id);
      final data = _apiClient.processResponse(response);
      return DbResult.fromJson(data);
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    }
  }
}
