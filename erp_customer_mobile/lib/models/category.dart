class Category {
  final int id;
  final String name;
  final String type;
  final String activeYn;

  Category({
    required this.id,
    required this.name,
    this.type = '',
    this.activeYn = 'Y',
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['ct_id'] ?? 0,
      name: json['ct_name'] ?? '',
      type: json['ct_type'] ?? '',
      activeYn: json['ct_active_yn'] ?? 'Y',
    );
  }
}

