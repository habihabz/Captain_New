import 'dart:convert';

class ProductColor {
  final int id;
  final String name;
  final String hex;

  ProductColor({required this.id, required this.name, required this.hex});

  factory ProductColor.fromJson(Map<String, dynamic> json) {
    final name = json['pc_color_name'] ?? json['pc_name'] ?? '';
    return ProductColor(
      id: json['pc_color'] ?? json['pc_id'] ?? 0,
      name: name,
      hex: json['pc_code'] ?? json['pc_hex'] ?? _getColorHex(name),
    );
  }

  static String _getColorHex(String name) {
    final lowerName = name.toLowerCase();
    if (lowerName.contains('black')) return '#000000';
    if (lowerName.contains('white')) return '#FFFFFF';
    if (lowerName.contains('blue')) return '#2196F3';
    if (lowerName.contains('navy')) return '#1A237E';
    if (lowerName.contains('red')) return '#F44336';
    if (lowerName.contains('grey') || lowerName.contains('gray')) return '#9E9E9E';
    if (lowerName.contains('yellow')) return '#FFEB3B';
    if (lowerName.contains('green')) return '#4CAF50';
    if (lowerName.contains('orange')) return '#FF9800';
    if (lowerName.contains('pink')) return '#E91E63';
    if (lowerName.contains('purple')) return '#9C27B0';
    return '#E0E0E0'; // Default light grey
  }
}

class ProductSize {
  final int id;
  final String name;

  ProductSize({required this.id, required this.name});

  factory ProductSize.fromJson(Map<String, dynamic> json) {
    return ProductSize(
      id: json['ps_size'] ?? json['ps_id'] ?? 0,
      name: json['ps_size_name'] ?? json['ps_name'] ?? '',
    );
  }
}

class Product {
  final int id;
  final String name;
  final String shortName;
  final String description;
  final int category;
  final String categoryName;
  final double price;
  final double rating;
  final String attachments; 
  final List<ProductColor> availableColors;
  final List<ProductSize> availableSizes;

  Product({
    this.id = 0,
    this.name = '',
    this.shortName = '',
    this.description = '',
    this.category = 0,
    this.categoryName = '',
    this.price = 0.0,
    this.rating = 0.0,
    this.attachments = '',
    this.availableColors = const [],
    this.availableSizes = const [],
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    List<ProductColor> colors = [];
    if (json['p_colors'] != null && json['p_colors'].toString().isNotEmpty) {
      try {
        final List<dynamic> parsed = jsonDecode(json['p_colors']);
        colors = parsed.map((c) => ProductColor.fromJson(c)).toList();
      } catch (_) {}
    }

    List<ProductSize> sizes = [];
    if (json['p_sizes'] != null && json['p_sizes'].toString().isNotEmpty) {
      try {
        final List<dynamic> parsed = jsonDecode(json['p_sizes']);
        sizes = parsed.map((s) => ProductSize.fromJson(s)).toList();
      } catch (_) {}
    }

    return Product(
      id: json['p_id'] ?? 0,
      name: json['p_name'] ?? '',
      shortName: json['p_short_name'] ?? '',
      description: json['p_description'] ?? '',
      category: json['p_category'] ?? 0,
      categoryName: json['p_category_name'] ?? '',
      price: (json['p_price'] ?? 0).toDouble(),
      rating: (json['p_overall_rating'] ?? 0).toDouble(),
      attachments: json['p_attachements'] ?? '',
      availableColors: colors,
      availableSizes: sizes,
    );
  }

  List<String> get imageList {
    if (attachments.isEmpty) return [];
    try {
      final List<dynamic> parsed = jsonDecode(attachments);
      return parsed.map((e) => e['pa_image_path'].toString()).toList();
    } catch (_) {
      return attachments.split(',');
    }
  }

  List<String> getImagesForColor(int colorId) {
    if (attachments.isEmpty) return [];
    try {
      final List<dynamic> parsed = jsonDecode(attachments);
      // Filter by color ID or show general images (color 0)
      final filtered = parsed.where((e) {
        final paColor = e['pa_color'] ?? 0;
        return paColor == colorId || paColor == 0;
      }).toList();
      
      if (filtered.isEmpty) return imageList;
      return filtered.map((e) => e['pa_image_path'].toString()).toList();
    } catch (_) {
      return imageList;
    }
  }
}
