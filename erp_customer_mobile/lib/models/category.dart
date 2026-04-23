class Category {
  final int ct_id;
  final String ct_name;
  final String ct_type;
  final String ct_active_yn;

  Category({
    required this.ct_id,
    required this.ct_name,
    this.ct_type = '',
    this.ct_active_yn = 'Y',
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      ct_id: json['ct_id'] ?? 0,
      ct_name: json['ct_name'] ?? '',
      ct_type: json['ct_type'] ?? '',
      ct_active_yn: json['ct_active_yn'] ?? 'Y',
    );
  }
}

