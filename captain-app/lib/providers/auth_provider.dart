import 'package:flutter/material.dart';
import '../models/customer.dart';
import '../services/auth_service.dart';
import 'package:google_sign_in/google_sign_in.dart';

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

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    serverClientId: '130186997553-8e8o1n0olv7ce7cm697ghnof3gk9bk1n.apps.googleusercontent.com',
  );

  Future<bool> googleLogin() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        // User canceled the sign-in
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        _errorMessage = 'Failed to get Google ID token';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final result = await _authService.googleLogin(idToken);
      if (result['message'] == 'Success') {
        _customer = Customer.fromJson(result['user']);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = _cleanErrorMessage(result['message'] ?? 'Google login failed');
        _isLoading = false;
        await _googleSignIn.signOut();
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = _cleanErrorMessage(e.toString());
      _isLoading = false;
      await _googleSignIn.signOut();
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
