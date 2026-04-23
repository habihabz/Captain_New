class Customer {
  final int u_id;
  final String u_name;
  final String u_email;
  final String u_phone;
  final String u_username;
  final String u_password;
  final String u_active_yn;
  final String? u_image_url;
  final String? u_date_of_birth;
  final String u_is_get_updates;
  final String u_agree_terms;

  Customer({
    this.u_id = 0,
    this.u_name = '',
    this.u_email = '',
    this.u_phone = '',
    this.u_username = '',
    this.u_password = '',
    this.u_active_yn = 'Y',
    this.u_image_url,
    this.u_date_of_birth,
    this.u_is_get_updates = 'N',
    this.u_agree_terms = 'N',
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      u_id: json['u_id'] ?? 0,
      u_name: json['u_name'] ?? '',
      u_email: json['u_email'] ?? '',
      u_phone: json['u_phone'] ?? '',
      u_username: json['u_username'] ?? '',
      u_active_yn: json['u_active_yn'] ?? 'Y',
      u_image_url: json['u_image_url'],
      u_date_of_birth: json['u_date_of_birth']?.toString(),
      u_is_get_updates: json['u_is_get_updates'] ?? 'N',
      u_agree_terms: json['u_agree_terms'] ?? 'N',
    );
  }

  Map<String, dynamic> toJson() => {
    'u_id': u_id,
    'u_name': u_name,
    'u_email': u_email,
    'u_phone': u_phone,
    'u_username': u_username,
    'u_password': u_password,
    'u_active_yn': u_active_yn,
    'u_image_url': u_image_url,
    'u_date_of_birth': u_date_of_birth,
    'u_is_get_updates': u_is_get_updates,
    'u_agree_terms': u_agree_terms,
  };
}
