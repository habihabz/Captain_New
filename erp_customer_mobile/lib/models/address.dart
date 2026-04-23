class Address {
  final int ad_id;
  final String ad_name;
  final String ad_address;
  final String ad_phone;
  final int ad_pincode;
  final String ad_is_default_yn;

  Address({
    this.ad_id = 0,
    this.ad_name = '',
    this.ad_address = '',
    this.ad_phone = '',
    this.ad_pincode = 0,
    this.ad_is_default_yn = 'N',
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      ad_id: json['ad_id'] ?? 0,
      ad_name: json['ad_name'] ?? '',
      ad_address: json['ad_address'] ?? '',
      ad_phone: json['ad_phone'] ?? '',
      ad_pincode: json['ad_pincode'] ?? 0,
      ad_is_default_yn: json['ad_is_default_yn'] ?? 'N',
    );
  }

  Map<String, dynamic> toJson() => {
    'ad_id': ad_id,
    'ad_name': ad_name,
    'ad_address': ad_address,
    'ad_phone': ad_phone,
    'ad_pincode': ad_pincode,
    'ad_is_default_yn': ad_is_default_yn,
  };
}
