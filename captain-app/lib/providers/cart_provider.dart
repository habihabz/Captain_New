import 'package:flutter/material.dart';
import '../models/cart.dart';
import '../models/db_result.dart';
import '../models/promo_code.dart';
import '../models/constant_value.dart';
import '../services/cart_service.dart';
import '../services/promo_code_service.dart';
import '../services/constant_value_service.dart';
import '../services/order_service.dart';
import '../models/request_parms.dart';
import 'dart:convert';

class CartProvider with ChangeNotifier {
  final CartService _cartService = CartService();
  final PromoCodeService _promoCodeService = PromoCodeService();
  final ConstantValueService _constantService = ConstantValueService();
  final OrderService _orderService = OrderService();
  
  List<Cart> _cartItems = [];
  List<ConstantValue> _constants = [];
  bool _isLoading = false;
  int _currentCountryId = 1; // Default to India
  
  PromoCode? _appliedPromoCode;
  String _promoErrorMessage = '';

  List<Cart> get cartItems => _cartItems;
  bool get isLoading => _isLoading;
  PromoCode? get appliedPromoCode => _appliedPromoCode;
  String get promoErrorMessage => _promoErrorMessage;
  
  // Dynamic Constants from API
  double get gstRate {
    final constant = _constants.firstWhere((c) => c.cv_name == 'Tax Percentage', orElse: () => ConstantValue(cv_value: '5'));
    return double.tryParse(constant.cv_value) ?? 5.0;
  }

  double get _gstRate => gstRate;

  double get _deliveryCharge {
    final constant = _constants.firstWhere((c) => c.cv_name == 'Delivery Charge', orElse: () => ConstantValue(cv_value: '40'));
    return double.tryParse(constant.cv_value) ?? 40.0;
  }

  String get currencySymbol {
    final constant = _constants.firstWhere((c) => c.cv_name == 'Default Currency', orElse: () => ConstantValue(cv_value: '₹'));
    return constant.cv_value.isEmpty ? '₹' : constant.cv_value;
  }

  // Basic Pricing
  double get subtotalAmount {
    return _cartItems.fold(0, (sum, item) => sum + item.c_price);
  }

  // GST (Calculated from API constant)
  double get gstAmount {
    // If GST is inclusive, formula: Total - (Total / (1 + rate/100))
    final rate = _gstRate;
    return subtotalAmount - (subtotalAmount / (1 + (rate / 100)));
  }

  // Delivery from API constant
  double get deliveryFee {
    // Angular handles delivery by directly using the constant value.
    // If and only if it's 0 or subtotal is 0, it's free.
    if (subtotalAmount == 0) return 0.0;
    return _deliveryCharge;
  }

  // Discount Calculation
  double get discountAmount {
    if (_appliedPromoCode == null) return 0.0;
    
    double discount = subtotalAmount * (_appliedPromoCode!.pc_discount_perc / 100);
    
    // Check for max discount
    if (_appliedPromoCode!.pc_max_discount_amount > 0 && 
        discount > _appliedPromoCode!.pc_max_discount_amount) {
      discount = _appliedPromoCode!.pc_max_discount_amount;
    }
    
    return discount;
  }

  double get grandTotal {
    return subtotalAmount + deliveryFee - discountAmount;
  }

  int get itemCount {
    return _cartItems.fold(0, (sum, item) => sum + item.c_qty);
  }

  void setCountryId(int id) {
    _currentCountryId = id;
  }

  Future<void> fetchConstants() async {
    try {
      _constants = await _constantService.getConstantValues();
    } catch (e) {
      debugPrint('Error fetching constants: $e');
    }
    notifyListeners();
  }

  Future<void> fetchCart(int customerId) async {
    _isLoading = true;
    notifyListeners();
    try {
      // Ensure constants are fetched first
      if (_constants.isEmpty) {
        await fetchConstants();
      }
      _cartItems = await _cartService.getCarts(customerId, _currentCountryId);
    } catch (e) {
      debugPrint('Error fetching cart: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<DbResult> applyPromoCode(String code) async {
    _isLoading = true;
    _promoErrorMessage = '';
    notifyListeners();
    
    try {
      final validationResult = await _promoCodeService.validatePromoCode(code);
      if (validationResult.status) {
        final pc = await _promoCodeService.getPromoCodeByCode(code);
        if (pc != null) {
          if (subtotalAmount < pc.pc_min_order_amount) {
            _promoErrorMessage = 'Min order amount for this coupon is ₹${pc.pc_min_order_amount}';
            _appliedPromoCode = null;
            return DbResult(status: false, message: _promoErrorMessage);
          }
          _appliedPromoCode = pc;
          return DbResult(status: true, message: 'Coupon applied successfully');
        }
      }
      _promoErrorMessage = validationResult.message;
      _appliedPromoCode = null;
      return validationResult;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void removePromoCode() {
    _appliedPromoCode = null;
    _promoErrorMessage = '';
    notifyListeners();
  }

  Future<DbResult> addToCart(Cart cart) async {
    _isLoading = true;
    notifyListeners();
    try {
      final result = await _cartService.addOrUpdateCart(cart);
      if (result.status) {
        await fetchCart(cart.c_cre_by);
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
    final index = _cartItems.indexWhere((item) => item.c_id == cartId);
    if (index != -1) {
      final cart = _cartItems[index];
      cart.c_qty = newQty;
      // Update line total using unit price if product is available, else try to derive it
      // Since Cart.fromJson might have filled 'product', we should use it.
      // In ICartService (Angular), they use cartItem.p_price.
      
      final updatedCart = Cart(
        c_id: cart.c_id,
        c_product: cart.c_product,
        c_size: cart.c_size,
        c_size_name: cart.c_size_name,
        c_color: cart.c_color,
        c_color_name: cart.c_color_name,
        c_qty: newQty,
        c_price: (cart.product?.p_price ?? (cart.c_price / (newQty + (newQty > cart.c_qty ? -1 : 1)))) * newQty,
        c_cre_by: cart.c_cre_by,
        c_country: cart.c_country,
      );

      await _cartService.addOrUpdateCart(updatedCart);
      await fetchCart(customerId);
    }
  }

  Future<DbResult> placeOrder({
    required int customerId,
    required int addressId,
    String paymentId = '',
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final cartJson = _cartItems.map((c) => {
        'c_id': c.c_id,
        'c_product': c.c_product,
        'c_size': c.c_size,
        'c_size_name': c.c_size_name,
        'c_color': c.c_color,
        'c_qty': c.c_qty,
        'c_price': (c.c_price * 100).round() / 100
      }).toList();

      final params = RequestParms(
        user: customerId,
        id: addressId, // co_c_address is often passed via 'id' in createOrUpdateCustomerOrder if following Angular logic
        details: jsonEncode(cartJson),
        others: _appliedPromoCode?.pc_code ?? '',
        paymentId: paymentId,
        amount: discountAmount, // Backend uses amount for promo discount in some places
      );

      final result = await _orderService.createOrUpdateCustomerOrder(params);
      if (result.status) {
        _cartItems = [];
        _appliedPromoCode = null;
        notifyListeners();
      }
      return result;
    } catch (e) {
      return DbResult(status: false, message: e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
