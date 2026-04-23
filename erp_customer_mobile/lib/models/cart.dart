import 'product.dart';

class Cart {
  final int c_id;
  final int c_product;
  final int c_size;
  final String c_size_name;
  final int c_color;
  final String c_color_name;
  int c_qty;
  final double c_price;
  final int c_cre_by;
  final int c_country;
  final Product? product; // For UI details

  Cart({
    this.c_id = 0,
    required this.c_product,
    this.c_size = 0,
    this.c_size_name = '',
    this.c_color = 0,
    this.c_color_name = '',
    this.c_qty = 1,
    this.c_price = 0.0,
    this.c_cre_by = 0,
    this.c_country = 0,
    this.product,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      c_id: json['c_id'] ?? 0,
      c_product: json['c_product'] ?? 0,
      c_size: json['c_size'] ?? 0,
      c_size_name: json['c_size_name'] ?? '',
      c_color: json['c_color'] ?? 0,
      c_color_name: json['c_color_name'] ?? '',
      c_qty: json['c_qty'] ?? 0,
      c_price: (json['c_price'] ?? 0).toDouble(),
      c_cre_by: json['c_cre_by'] ?? 0,
      c_country: json['c_country'] ?? 0,
      product: json['p_id'] != null ? Product.fromJson(json) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'c_id': c_id,
      'c_product': c_product,
      'c_size': c_size,
      'c_size_name': c_size_name,
      'c_color': c_color,
      'c_color_name': c_color_name,
      'c_qty': c_qty,
      'c_price': c_price,
      'c_cre_by': c_cre_by,
      'c_country': c_country,
    };
  }
}
