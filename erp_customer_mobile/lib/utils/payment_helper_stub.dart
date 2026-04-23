import 'package:razorpay_flutter/razorpay_flutter.dart';

void startPaymentWeb({
  required Map<String, dynamic> options,
  required Function(PaymentSuccessResponse) onSuccess,
  required Function(PaymentFailureResponse) onError,
}) {
  throw UnsupportedError('Cannot start web payment on this platform');
}
