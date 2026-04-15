import 'package:flutter/material.dart';
import '../models/cart.dart';
import '../models/db_result.dart';
import '../services/cart_service.dart';

class CartProvider with ChangeNotifier {
  final CartService _cartService = CartService();
  List<Cart> _cartItems = [];
  bool _isLoading = false;
  int _currentCountryId = 1; // Default to India

  List<Cart> get cartItems => _cartItems;
  bool get isLoading => _isLoading;
  
  double get totalAmount {
    return _cartItems.fold(0, (sum, item) => sum + (item.price * item.qty));
  }

  int get itemCount {
    return _cartItems.fold(0, (sum, item) => sum + item.qty);
  }

  void setCountryId(int id) {
    _currentCountryId = id;
  }

  Future<void> fetchCart(int customerId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _cartItems = await _cartService.getCarts(customerId, _currentCountryId);
    } catch (e) {
      debugPrint('Error fetching cart: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<DbResult> addToCart(Cart cart) async {
    _isLoading = true;
    notifyListeners();
    try {
      final result = await _cartService.addOrUpdateCart(cart);
      if (result.status) {
        await fetchCart(cart.creBy);
      }
      return result;
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<DbResult> removeFromCart(int cartId, int customerId) async {
    _isLoading = true;
    notifyListeners();
    try {
      final result = await _cartService.deleteCart(cartId);
      if (result.status) {
        await fetchCart(customerId);
      }
      return result;
    } catch (e) {
      return DbResult(message: e.toString(), status: false);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateQuantity(int cartId, int newQty, int customerId) async {
    final index = _cartItems.indexWhere((item) => item.id == cartId);
    if (index != -1) {
      final cart = _cartItems[index];
      cart.qty = newQty;
      await _cartService.addOrUpdateCart(cart);
      await fetchCart(customerId);
    }
  }
}
