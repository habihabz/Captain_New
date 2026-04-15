class ProductAttachment {
  final int id;
  final int productId;
  final int colorId;
  final String colorName;
  final String imagePath;

  ProductAttachment({
    this.id = 0,
    this.productId = 0,
    this.colorId = 0,
    this.colorName = '',
    this.imagePath = '',
  });

  factory ProductAttachment.fromJson(Map<String, dynamic> json) {
    return ProductAttachment(
      id: json['pa_id'] ?? 0,
      productId: json['pa_prod_id'] ?? 0,
      colorId: json['pa_color'] ?? 0,
      colorName: json['pa_color_name'] ?? '',
      imagePath: json['pa_image_path'] ?? '',
    );
  }
}
