import 'package:flutter/foundation.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../utils/constants.dart';
import '../utils/payment_helper.dart';
import 'api_client.dart';

class PaymentService {
  late Razorpay _razorpay;
  final Function(PaymentSuccessResponse) onSuccess;
  final Function(PaymentFailureResponse) onError;
  final Function(ExternalWalletResponse) onExternalWallet;

  PaymentService({
    required this.onSuccess,
    required this.onError,
    required this.onExternalWallet,
  }) {
    if (!kIsWeb) {
      _razorpay = Razorpay();
      _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, onSuccess);
      _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, onError);
      _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, onExternalWallet);
    }
  }

  final ApiClient _apiClient = ApiClient();

  Future<String?> createPaymentOrder(double amount) async {
    try {
      final response = await _apiClient.post('/Payment/create-order', {
        'amount': amount,
      });
      final data = _apiClient.processResponse(response);
      return data['orderId'] as String?;
    } catch (e) {
      debugPrint('Error creating payment order: $e');
      return null;
    }
  }

  void startPayment({
    required double amount,
    required String name,
    required String description,
    required String contact,
    required String email,
    String? orderId,
  }) {
    var options = {
      'key': AppConstants.razorpayKey,
      'amount': (amount * 100).toInt(),
      'name': 'Captain',
      'description': description,
      'order_id': orderId,
      'prefill': {
        'contact': contact,
        'email': email,
      },
      'theme': {
        'color': '#3399cc'
      },
      'method': {
        'netbanking': true,
        'card': true,
        'upi': true,
        'vpa': true, // Explicitly enable UPI ID
        'wallet': true,
      },
      'external': {
        'wallets': ['paytm']
      }
    };

    if (kIsWeb) {
      try {
        startPaymentWeb(
          options: options,
          onSuccess: onSuccess,
          onError: onError,
        );
      } catch (e) {
        debugPrint('Web Payment error: $e');
        onError(PaymentFailureResponse(2, e.toString(), {}));
      }
    } else {
      try {
        _razorpay.open(options);
      } catch (e) {
        debugPrint('Mobile Payment error: $e');
        onError(PaymentFailureResponse(2, e.toString(), {}));
      }
    }
  }

  void dispose() {
    if (!kIsWeb) {
      _razorpay.clear();
    }
  }
}
