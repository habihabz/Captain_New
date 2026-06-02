class PromoCode {
  final int pc_id;
  final String pc_code;
  final double pc_discount_perc;
  final double pc_max_discount_amount;
  final double pc_min_order_amount;
  final DateTime? pc_expiry_date;
  final String pc_active_yn;

  PromoCode({
    this.pc_id = 0,
    this.pc_code = '',
    this.pc_discount_perc = 0.0,
    this.pc_max_discount_amount = 0.0,
    this.pc_min_order_amount = 0.0,
    this.pc_expiry_date,
    this.pc_active_yn = 'Y',
  });

  factory PromoCode.fromJson(Map<String, dynamic> json) {
    return PromoCode(
      pc_id: json['pc_id'] ?? 0,
      pc_code: json['pc_code'] ?? '',
      pc_discount_perc: (json['pc_discount_perc'] ?? 0.0).toDouble(),
      pc_max_discount_amount: (json['pc_max_discount_amount'] ?? 0.0).toDouble(),
      pc_min_order_amount: (json['pc_min_order_amount'] ?? 0.0).toDouble(),
      pc_expiry_date: json['pc_expiry_date'] != null ? DateTime.parse(json['pc_expiry_date']) : null,
      pc_active_yn: json['pc_active_yn'] ?? 'Y',
    );
  }

  Map<String, dynamic> toJson() => {
    'pc_id': pc_id,
    'pc_code': pc_code,
    'pc_discount_perc': pc_discount_perc,
    'pc_max_discount_amount': pc_max_discount_amount,
    'pc_min_order_amount': pc_min_order_amount,
    'pc_expiry_date': pc_expiry_date?.toIso8601String(),
    'pc_active_yn': pc_active_yn,
  };
}
