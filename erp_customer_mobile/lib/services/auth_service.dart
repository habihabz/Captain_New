import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/customer.dart';
import '../models/db_result.dart';
import '../utils/constants.dart';
import 'api_client.dart';

class AuthService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> login(String username, String password) async {
    try {
      final response = await _apiClient.post('/Customer/getCustomerLogin', {
        'username': username,
        'password': password,
      });

      final data = _apiClient.processResponse(response);
      
      if (data['message'] == 'Success') {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.tokenKey, data['token']);
        await prefs.setString(AppConstants.userDataKey, jsonEncode(data['customer']));
      }
      
      return data;
    } catch (e) {
      return {'message': 'Error: ${e.toString()}', 'status': false};
    }
  }

  Future<DbResult> register(Customer customer, String password) async {
    try {
      final customerJson = customer.toJson();
      customerJson['password'] = password; // Assuming backend expects password in the same object or separate
      
      final response = await _apiClient.post('/Customer/registerCustomer', customerJson);
      final data = _apiClient.processResponse(response);
      return DbResult.fromJson(data);
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userDataKey);
  }

  Future<DbResult> updateProfile(Customer customer) async {
    try {
      final response = await _apiClient.post('/Customer/createOrUpdateCustomer', customer.toJson());
      final data = _apiClient.processResponse(response);
      
      // Update stored data if successful
      if (data['status'] == true) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.userDataKey, jsonEncode(customer.toJson()));
      }
      
      return DbResult.fromJson(data);
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    }
  }

  Future<DbResult> updatePassword(int customerId, String newPassword) async {
    try {
      // Trying to use a consistent naming pattern even if we need to add it to backend
      final response = await _apiClient.post('/Customer/updatePassword', {
        'userId': customerId,
        'newPassword': newPassword,
      });
      final data = _apiClient.processResponse(response);
      return DbResult.fromJson(data);
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    }
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey(AppConstants.tokenKey);
  }

  Future<Customer?> getStoredCustomer() async {
    final prefs = await SharedPreferences.getInstance();
    final customerJson = prefs.getString(AppConstants.userDataKey);
    if (customerJson != null) {
      return Customer.fromJson(jsonDecode(customerJson));
    }
    return null;
  }
}
