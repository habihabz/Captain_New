import '../models/promo_code.dart';
import '../models/db_result.dart';
import 'api_client.dart';

class PromoCodeService {
  final ApiClient _apiClient = ApiClient();

  Future<PromoCode?> getPromoCodeByCode(String code) async {
    try {
      final response = await _apiClient.post('/Promocode/getPromocodeByCode', code);
      final json = _apiClient.processResponse(response);
      if (json == null) return null;
      return PromoCode.fromJson(json);
    } catch (e) {
      return null;
    }
  }

  Future<DbResult> validatePromoCode(String code) async {
    try {
      final response = await _apiClient.post('/Promocode/validatePromocode', code);
      final json = _apiClient.processResponse(response);
      return DbResult.fromJson(json);
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    }
  }
}
