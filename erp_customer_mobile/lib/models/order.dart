class Order {
  final int id;
  final int customerId;
  final String statusName;
  final int qty;
  final String productName;
  final double netAmount;
  final String paymentId;
  final DateTime creDate;

  Order({
    required this.id,
    required this.customerId,
    required this.statusName,
    required this.qty,
    required this.productName,
    required this.netAmount,
    required this.paymentId,
    required this.creDate,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['co_id'] ?? 0,
      customerId: json['co_customer'] ?? 0,
      statusName: json['co_status_name'] ?? '',
      qty: json['co_qty'] ?? 0,
      productName: json['co_product_name'] ?? '',
      netAmount: (json['co_net_amount'] ?? 0.0).toDouble(),
      paymentId: json['co_payment_id'] ?? '',
      creDate: DateTime.parse(json['co_cre_date'] ?? DateTime.now().toIso8601String()),
    );
  }
}
