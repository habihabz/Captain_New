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
      final response = await _apiClient.post('/Login/getlogin', {
        'username': username,
        'password': password,
      });

      final data = _apiClient.processResponse(response);
      
      if (data['message'] == 'Success') {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.tokenKey, data['token']);
        await prefs.setString(AppConstants.userDataKey, jsonEncode(data['user']));
      }
      
      return data;
    } catch (e) {
      return {'message': 'Error: ${e.toString()}', 'status': false};
    }
  }

  Future<DbResult> register(Customer customer, String password) async {
    try {
      final userJson = customer.toJson();
      userJson['u_password'] = password; 
      
      final response = await _apiClient.post('/User/registerUser', userJson);
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
      final response = await _apiClient.post('/User/createOrUpdateUser', customer.toJson());
      final data = _apiClient.processResponse(response);
      
      if (data['status'] == true) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.userDataKey, jsonEncode(customer.toJson()));
      }
      
      return DbResult.fromJson(data);
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    }
  }

  Future<DbResult> uploadProfileImage(int customerId, String filePath) async {
    try {
      final response = await _apiClient.multipartPost(
        '/Customer/uploadProfileImage',
        {'id': customerId.toString()},
        filePath,
        'image'
      );
      
      final data = _apiClient.processResponse(response);
      return DbResult.fromJson(data);
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    }
  }

  // Use consistent naming - redirect to User endpoint
  Future<DbResult> updatePassword(int customerId, String newPassword) async {
    try {
      final response = await _apiClient.post('/User/updatePassword', {
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
