import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);
    
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<http.Response> get(String endpoint) async {
    final url = Uri.parse('${AppConstants.baseApiUrl}$endpoint');
    final headers = await _getHeaders();
    return await http.get(url, headers: headers);
  }

  Future<http.Response> post(String endpoint, dynamic body) async {
    final url = Uri.parse('${AppConstants.baseApiUrl}$endpoint');
    final headers = await _getHeaders();
    return await http.post(
      url, 
      headers: headers, 
      body: jsonEncode(body),
    );
  }

  Future<http.Response> multipartPost(String endpoint, Map<String, String> fields, String filePath, String fileKey) async {
    final url = Uri.parse('${AppConstants.baseApiUrl}$endpoint');
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);
    
    var request = http.MultipartRequest('POST', url);
    
    // Add headers
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    
    // Add fields
    request.fields.addAll(fields);
    
    // Add file
    request.files.add(await http.MultipartFile.fromPath(fileKey, filePath));
    
    final streamedResponse = await request.send();
    return await http.Response.fromStream(streamedResponse);
  }

  // Handle Response
  dynamic processResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    } else {
      throw Exception('API Error: ${response.statusCode} - ${response.body}');
    }
  }
}
