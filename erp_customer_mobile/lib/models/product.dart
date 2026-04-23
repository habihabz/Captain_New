import 'dart:convert';

class ProductColor {
  final int pc_id;
  final String pc_name;
  final String pc_code;

  ProductColor({required this.pc_id, required this.pc_name, required this.pc_code});

  factory ProductColor.fromJson(Map<String, dynamic> json) {
    return ProductColor(
      pc_id: json['pc_color'] ?? json['pc_id'] ?? 0,
      pc_name: json['pc_color_name'] ?? json['pc_name'] ?? '',
      pc_code: json['pc_code'] ?? json['pc_hex'] ?? '#E0E0E0',
    );
  }
}

class ProductSize {
  final int ps_id;
  final String ps_name;

  ProductSize({required this.ps_id, required this.ps_name});

  factory ProductSize.fromJson(Map<String, dynamic> json) {
    return ProductSize(
      ps_id: json['ps_size'] ?? json['ps_id'] ?? 0,
      ps_name: json['ps_size_name'] ?? json['ps_name'] ?? '',
    );
  }
}

class Product {
  final int p_id;
  final String p_name;
  final String p_short_name;
  final String p_description;
  final int p_category;
  final String p_category_name;
  final double p_price;
  final double p_overall_rating;
  final String p_attachements; 
  final List<ProductColor> availableColors;
  final List<ProductSize> availableSizes;

  Product({
    this.p_id = 0,
    this.p_name = '',
    this.p_short_name = '',
    this.p_description = '',
    this.p_category = 0,
    this.p_category_name = '',
    this.p_price = 0.0,
    this.p_overall_rating = 0.0,
    this.p_attachements = '',
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
      p_id: json['p_id'] ?? 0,
      p_name: json['p_name'] ?? '',
      p_short_name: json['p_short_name'] ?? '',
      p_description: json['p_description'] ?? '',
      p_category: json['p_category'] ?? 0,
      p_category_name: json['p_category_name'] ?? '',
      p_price: (json['p_price'] ?? 0).toDouble(),
      p_overall_rating: (json['p_overall_rating'] ?? 0).toDouble(),
      p_attachements: json['p_attachements'] ?? '',
      availableColors: colors,
      availableSizes: sizes,
    );
  }

  List<String> get imageList {
    if (p_attachements.isEmpty) return [];
    try {
      final List<dynamic> parsed = jsonDecode(p_attachements);
      return parsed.map((e) => e['pa_image_path'].toString()).toList();
    } catch (_) {
      return p_attachements.split(',');
    }
  }

  List<String> getImagesForColor(int colorId) {
    if (p_attachements.isEmpty) return [];
    try {
      final List<dynamic> parsed = jsonDecode(p_attachements);
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
