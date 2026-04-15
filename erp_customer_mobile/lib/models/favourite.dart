import 'product.dart';

class Favourite {
  final int id;
  final int productId;
  final int createdBy;
  final String createdByName;
  final DateTime createdOn;
  final Product? product; // The product details are usually returned via ProductForExtend

  Favourite({
    this.id = 0,
    required this.productId,
    this.createdBy = 0,
    this.createdByName = '',
    DateTime? createdOn,
    this.product,
  }) : createdOn = createdOn ?? DateTime.now();

  factory Favourite.fromJson(Map<String, dynamic> json) {
    return Favourite(
      id: json['f_id'] ?? 0,
      productId: json['f_product'] ?? 0,
      createdBy: json['f_cre_by'] ?? 0,
      createdByName: json['f_cre_by_name'] ?? '',
      createdOn: json['f_cre_date'] != null 
          ? DateTime.parse(json['f_cre_date']) 
          : DateTime.now(),
      product: json.containsKey('p_id') ? Product.fromJson(json) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'f_id': id,
      'f_product': productId,
      'f_cre_by': createdBy,
      'f_cre_by_name': createdByName,
      'f_cre_date': createdOn.toIso8601String(),
    };
  }
}
