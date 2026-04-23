class Order {
  final int co_id;
  final int co_customer;
  final String co_status_name;
  final int co_qty;
  final String co_product_name;
  final double co_unit_price;
  final double co_amount; // Subtotal before tax/delivery
  final double co_discount_perc;
  final double co_discount_amount;
  final String? co_promo_code;
  final double co_gst_amount;
  final double co_delivery_charge;
  final double co_net_amount;
  final String co_payment_id;
  final DateTime co_cre_date;
  final int? co_product;
  final String? p_attachements;
  final int? co_color;
  final String? co_color_name;
  final String? co_size_name;
  final String co_is_canceled;
  final String co_is_returned;

  Order({
    required this.co_id,
    required this.co_customer,
    required this.co_status_name,
    required this.co_qty,
    required this.co_product_name,
    required this.co_unit_price,
    required this.co_amount,
    required this.co_discount_perc,
    required this.co_discount_amount,
    this.co_promo_code,
    required this.co_gst_amount,
    required this.co_delivery_charge,
    required this.co_net_amount,
    required this.co_payment_id,
    required this.co_cre_date,
    this.co_product,
    this.p_attachements,
    this.co_color,
    this.co_color_name,
    this.co_size_name,
    required this.co_is_canceled,
    required this.co_is_returned,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      if (val is String) return double.tryParse(val) ?? 0.0;
      return 0.0;
    }

    return Order(
      co_id: json['co_id'] ?? 0,
      co_customer: json['co_customer'] ?? 0,
      co_status_name: json['co_status_name'] ?? '',
      co_qty: json['co_qty'] ?? 0,
      co_product_name: json['co_product_name'] ?? '',
      co_unit_price: parseDouble(json['co_unit_price']),
      co_amount: parseDouble(json['co_amount']),
      co_discount_perc: parseDouble(json['co_discount_perc']),
      co_discount_amount: parseDouble(json['co_discount_amount']),
      co_promo_code: json['co_promo_code'],
      co_gst_amount: parseDouble(json['co_gst_amount']),
      co_delivery_charge: parseDouble(json['co_delivery_charge']),
      co_net_amount: parseDouble(json['co_net_amount']),
      co_payment_id: json['co_payment_id'] ?? '',
      co_cre_date: DateTime.parse(json['co_cre_date'] ?? DateTime.now().toIso8601String()),
      co_product: json['co_product'],
      p_attachements: json['p_attachements'] ?? '',
      co_color: json['co_color'],
      co_color_name: json['co_color_name'],
      co_size_name: json['co_size_name'],
      co_is_canceled: json['co_is_canceled'] ?? 'N',
      co_is_returned: json['co_is_returned'] ?? 'N',
    );
  }
}
