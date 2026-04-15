class Customer {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String username;
  final String password;
  final String activeYn;

  Customer({
    this.id = 0,
    this.name = '',
    this.email = '',
    this.phone = '',
    this.username = '',
    this.password = '',
    this.activeYn = 'Y',
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['c_id'] ?? 0,
      name: json['c_name'] ?? '',
      email: json['c_email'] ?? '',
      phone: json['c_phone'] ?? '',
      username: json['c_username'] ?? '',
      activeYn: json['c_active_yn'] ?? 'Y',
    );
  }

  Map<String, dynamic> toJson() => {
    'c_id': id,
    'c_name': name,
    'c_email': email,
    'c_phone': phone,
    'c_username': username,
    'c_password': password,
    'c_active_yn': activeYn,
  };
}
