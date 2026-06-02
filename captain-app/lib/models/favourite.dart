import 'product.dart';

class Favourite {
  final int f_id;
  final int f_product;
  final int f_cre_by;
  final String f_cre_by_name;
  final DateTime f_cre_date;
  final Product? product; 

  Favourite({
    this.f_id = 0,
    required this.f_product,
    this.f_cre_by = 0,
    this.f_cre_by_name = '',
    DateTime? f_cre_date,
    this.product,
  }) : f_cre_date = f_cre_date ?? DateTime.now();

  factory Favourite.fromJson(Map<String, dynamic> json) {
    return Favourite(
      f_id: json['f_id'] ?? 0,
      f_product: json['f_product'] ?? 0,
      f_cre_by: json['f_cre_by'] ?? 0,
      f_cre_by_name: json['f_cre_by_name'] ?? '',
      f_cre_date: json['f_cre_date'] != null 
          ? DateTime.parse(json['f_cre_date']) 
          : DateTime.now(),
      product: json.containsKey('p_id') ? Product.fromJson(json) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'f_id': f_id,
      'f_product': f_product,
      'f_cre_by': f_cre_by,
      'f_cre_by_name': f_cre_by_name,
      'f_cre_date': f_cre_date.toIso8601String(),
    };
  }
}
