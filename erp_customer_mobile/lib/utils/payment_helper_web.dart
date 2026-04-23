import 'dart:js_interop';
import 'dart:js_interop_unsafe';
import 'package:razorpay_flutter/razorpay_flutter.dart';

@JS('Razorpay')
extension type JS_Razorpay._(JSObject _) implements JSObject {
  external factory JS_Razorpay(JSObject options);
  external void open();
}

void startPaymentWeb({
  required Map<String, dynamic> options,
  required Function(PaymentSuccessResponse) onSuccess,
  required Function(PaymentFailureResponse) onError,
}) {
  // Use JSObject from dart:js_interop_unsafe to set the handler
  final jsOptions = options.jsify() as JSObject;
  
  jsOptions.setProperty('handler'.toJS, ((JSObject response) {
    final paymentId = response.getProperty('razorpay_payment_id'.toJS) as JSString?;
    final orderId = response.getProperty('razorpay_order_id'.toJS) as JSString?;
    final signature = response.getProperty('razorpay_signature'.toJS) as JSString?;

    if (paymentId != null) {
      onSuccess(PaymentSuccessResponse(
        paymentId.toDart,
        orderId?.toDart,
        signature?.toDart,
        {
          'razorpay_payment_id': paymentId.toDart,
          'razorpay_order_id': orderId?.toDart,
          'razorpay_signature': signature?.toDart
        }
      ));
    } else {
      onError(PaymentFailureResponse(0, "Payment Failed", {}));
    }
  }).toJS);

  final modal = JSObject();
  modal.setProperty('ondismiss'.toJS, (() {
    onError(PaymentFailureResponse(0, "Payment Cancelled", {}));
  }).toJS);
  
  jsOptions.setProperty('modal'.toJS, modal);

  final rzp = JS_Razorpay(jsOptions);
  rzp.open();
}
