import 'package:flutter/material.dart';
import '../models/customer.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  Customer? _customer;
  bool _isLoading = false;
  String? _errorMessage;

  Customer? get customer => _customer;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _customer != null;
  String? get errorMessage => _errorMessage;

  Future<void> init() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    final loggedIn = await _authService.isLoggedIn();
    if (loggedIn) {
      _customer = await _authService.getStoredCustomer();
    }
    
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _authService.login(username, password);
      if (result['message'] == 'Success') {
        _customer = Customer.fromJson(result['user']);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = _cleanErrorMessage(result['message'] ?? 'Login failed');
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = _cleanErrorMessage(e.toString());
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  String _cleanErrorMessage(String message) {
    // Remove "Error: ", "Exception: ", and HTTP status codes
    return message
        .replaceFirst(RegExp(r'^(Error|Exception):\s*'), '')
        .replaceFirst(RegExp(r'\(?code:\s*\d+\)?\s*'), '')
        .trim();
  }

  Future<void> logout() async {
    await _authService.logout();
    _customer = null;
    notifyListeners();
  }

  Future<bool> uploadProfileImage(String filePath) async {
    if (_customer == null) return false;
    
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _authService.uploadProfileImage(_customer!.u_id, filePath);
      if (result.status) {
        // Refresh customer data
        _customer = await _authService.getStoredCustomer();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = _cleanErrorMessage(result.message);
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = _cleanErrorMessage(e.toString());
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
