import '../models/category.dart';
import '../models/product.dart';
import '../models/product_attachment.dart';
import '../models/request_parms.dart';
import 'api_client.dart';

class ProductService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Product>> getProductsByCountry(int countryId) async {
    try {
      // Use regional endpoint to get products with prices
      final response = await _apiClient.post('/Product/getProductsByCountry', countryId);
      final List<dynamic> data = _apiClient.processResponse(response);
      return data.map((json) => Product.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<List<Product>> getProductsByFilters(ProductSearchParms parms) async {
    try {
      final response = await _apiClient.post('/Product/getProductsByFilters', parms.toJson());
      final List<dynamic> data = _apiClient.processResponse(response);
      return data.map((json) => Product.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<Product?> getProduct(int id) async {
    try {
      final response = await _apiClient.post('/Product/getProduct', id);
      final json = _apiClient.processResponse(response);
      return Product.fromJson(json);
    } catch (e) {
      return null;
    }
  }

  Future<Product?> getProductByCountry(int productId, int countryId) async {
    try {
      final response = await _apiClient.post('/Product/getProductByCountry', RequestParms(
        id: productId,
        country: countryId,
      ).toJson());
      final json = _apiClient.processResponse(response);
      return Product.fromJson(json);
    } catch (e) {
      return null;
    }
  }

  Future<List<ProductAttachment>> getProductAttachmentsByColor(int productId, int colorId) async {
    try {
      final response = await _apiClient.post('/Product/getProductAttachementsByColor', RequestParms(
        id: productId,
        color: colorId,
      ).toJson());
      final List<dynamic> data = _apiClient.processResponse(response);
      return data.map((json) => ProductAttachment.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<List<Category>> getCategories() async {
    try {
      final response = await _apiClient.post('/Category/getCategories', {});
      final List<dynamic> data = _apiClient.processResponse(response);
      return data.map((json) => Category.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }
}
