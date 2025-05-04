class Product {
  final String name;
  final String description;
  final double price;
  final List<String> imageUrls;
  final List<String> specs;
  final int stock;
  final int numStars;
  final bool recommendedFor;
  final int sales;
  final List<ColorOption> colorOptions;

  Product({
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrls,
    required this.specs,
    required this.stock,
    required this.numStars,
    required this.recommendedFor,
    required this.sales,
    required this.colorOptions,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] as num).toDouble(),
      imageUrls: List<String>.from(json['imageUrls'] ?? []),
      specs: List<String>.from(json['specs'] ?? []),
      stock: json['stock'] ?? 0,
      numStars: json['numStars'] ?? 5,
      recommendedFor: json['recommendedFor'] ?? false,
      sales: json['sales'] ?? 0,
      colorOptions: (json['colorOptions'] as List<dynamic>? ?? [])
          .map((e) => ColorOption.fromJson(e))
          .toList(),
    );
  }
}

class ColorOption {
  final String name;
  final String type; // 'solid', 'split', 'swatch'
  final List<String> colors;
  final String swatchUrl;
  final String imageUrl;

  ColorOption({
    required this.name,
    required this.type,
    required this.colors,
    required this.swatchUrl,
    required this.imageUrl,
  });

  factory ColorOption.fromJson(Map<String, dynamic> json) {
    return ColorOption(
      name: json['name'],
      type: json['type'],
      colors: List<String>.from(json['colors'] ?? []),
      swatchUrl: json['swatchUrl'] ?? '',
      imageUrl: json['imageUrl'],
    );
  }
}
