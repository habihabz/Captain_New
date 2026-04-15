import 'product.dart';

class Cart {
  final int id;
  final int productId;
  final int size;
  final String sizeName;
  final int color;
  final String colorName;
  int qty;
  final double price;
  final int creBy;
  final int country;
  final Product? product; // For UI details

  Cart({
    this.id = 0,
    required this.productId,
    this.size = 0,
    this.sizeName = '',
    this.color = 0,
    this.colorName = '',
    this.qty = 1,
    this.price = 0.0,
    this.creBy = 0,
    this.country = 0,
    this.product,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      id: json['c_id'] ?? 0,
      productId: json['c_product'] ?? 0,
      size: json['c_size'] ?? 0,
      sizeName: json['c_size_name'] ?? '',
      color: json['c_color'] ?? 0,
      colorName: json['c_color_name'] ?? '',
      qty: json['c_qty'] ?? 0,
      price: (json['c_price'] ?? 0).toDouble(),
      creBy: json['c_cre_by'] ?? 0,
      country: json['c_country'] ?? 0,
      // The backend might return product details mixed in or as a nested object
      product: json['p_id'] != null ? Product.fromJson(json) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'c_id': id,
      'c_product': productId,
      'c_size': size,
      'c_size_name': sizeName,
      'c_color': color,
      'c_color_name': colorName,
      'c_qty': qty,
      'c_price': price,
      'c_cre_by': creBy,
      'c_country': country,
    };
  }
}
