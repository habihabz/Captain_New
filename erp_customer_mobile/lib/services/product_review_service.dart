import '../models/product_review.dart';
import '../models/db_result.dart';
import 'api_client.dart';

class ProductReviewService {
  final ApiClient _apiClient = ApiClient();

  Future<List<ProductReview>> getProductReviews(int productId) async {
    try {
      final response = await _apiClient.post('/ProductReview/getProductReviews', productId);
      final List<dynamic> data = _apiClient.processResponse(response);
      return data.map((json) => ProductReview.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<DbResult> submitReview(ProductReview review) async {
    try {
      final response = await _apiClient.post(
        '/ProductReview/createOrUpdateProductReview',
        review.toJson(),
      );
      final data = _apiClient.processResponse(response);
      return DbResult.fromJson(data);
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    }
  }
}
