import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';

class GlassesVariant {
  final String name;
  final String variantId;
  final Color color;

  const GlassesVariant({
    required this.name,
    required this.variantId,
    required this.color,
  });
}

class GlassesModel {
  final String id;
  final String name;
  final List<GlassesVariant> variants;
  final String thumbnailPath;

  const GlassesModel({
    required this.id,
    required this.name,
    required this.variants,
    required this.thumbnailPath,
  });
}

const mockModels = [
  GlassesModel(
    id: 'bennett',
    name: 'Bennett',
    thumbnailPath: 'assets/models/bennett/bennett.png',
    variants: [
      GlassesVariant(name: 'Rich Black', variantId: 'rich-black', color: Colors.black),
      GlassesVariant(name: 'Ash', variantId: 'ash', color: Colors.grey),
      GlassesVariant(name: 'Honey Tort', variantId: 'honey-tort', color: Colors.amber),
      GlassesVariant(name: 'Matcha', variantId: 'matcha', color: Colors.green),
    ],
  ),
  GlassesModel(
    id: 'cove',
    name: 'Cove',
    thumbnailPath: 'assets/models/cove/cove.png',
    variants: [
      GlassesVariant(name: 'Rich Black', variantId: 'rich-black', color: Colors.black),
      GlassesVariant(name: 'Pandan', variantId: 'pandan', color: Colors.lightGreen),
      GlassesVariant(name: 'Petal', variantId: 'petal', color: Colors.pinkAccent),
      GlassesVariant(name: 'Space Gray', variantId: 'space-gray', color: Colors.grey),
    ],
  ),
  GlassesModel(
    id: 'elba',
    name: 'Elba',
    thumbnailPath: 'assets/models/elba/elba.png',
    variants: [
      GlassesVariant(name: 'Rich Black', variantId: 'rich-black', color: Colors.black),
      GlassesVariant(name: 'Almond', variantId: 'almond', color: Color(0xFFD2B48C)), // Tan
      GlassesVariant(name: 'Cherry', variantId: 'cherry', color: Colors.redAccent),
      GlassesVariant(name: 'Jelly', variantId: 'jelly', color: Colors.lightBlueAccent),
    ],
  ),
  GlassesModel(
    id: 'jax',
    name: 'Jax',
    thumbnailPath: 'assets/models/jax/jax.png',
    variants: [
      GlassesVariant(name: 'Rich Black', variantId: 'rich-black', color: Colors.black),
      GlassesVariant(name: 'Honey Tort', variantId: 'honey-tort', color: Colors.amber),
      GlassesVariant(name: 'Peony', variantId: 'peony', color: Colors.pink),
      GlassesVariant(name: 'Pickle', variantId: 'pickle', color: Color(0xFF2E8B57)), // SeaGreen
    ],
  ),
  GlassesModel(
    id: 'lana',
    name: 'Lana',
    thumbnailPath: '', // No thumbnail available
    variants: [
      GlassesVariant(name: 'Rich Black', variantId: 'rich-black', color: Colors.black),
      GlassesVariant(name: 'Amber Tort', variantId: 'amber-tort', color: Colors.orange),
      GlassesVariant(name: 'Mint', variantId: 'mint', color: Colors.tealAccent),
      GlassesVariant(name: 'Space Gray', variantId: 'space-gray', color: Colors.grey),
    ],
  ),
  GlassesModel(
    id: 'leto',
    name: 'Leto',
    thumbnailPath: 'assets/models/leto/leto.png',
    variants: [
      GlassesVariant(name: 'Rich Black', variantId: 'rich-black', color: Colors.black),
      GlassesVariant(name: 'Stone', variantId: 'stone', color: Color(0xFF878681)), // Stone grey
    ],
  ),
  GlassesModel(
    id: 'lindy',
    name: 'Lindy',
    thumbnailPath: 'assets/models/lindy/lindy.png',
    variants: [
      GlassesVariant(name: 'Rich Black', variantId: 'rich-black', color: Colors.black),
      GlassesVariant(name: 'Cherry', variantId: 'cherry', color: Colors.red),
      GlassesVariant(name: 'Chestnut', variantId: 'chestnut', color: Colors.brown),
      GlassesVariant(name: 'Horchata', variantId: 'horchata', color: Color(0xFFF5F5DC)), // Beige
      GlassesVariant(name: 'Lemonade', variantId: 'lemonade', color: Colors.yellow),
      GlassesVariant(name: 'Milk', variantId: 'milk', color: Colors.white),
      GlassesVariant(name: 'Pear', variantId: 'pear', color: Colors.lightGreen),
      GlassesVariant(name: 'Plum', variantId: 'plum', color: Colors.purple),
      GlassesVariant(name: 'Smoke', variantId: 'smoke', color: Color(0xFF555555)),
    ],
  ),
  GlassesModel(
    id: 'lou',
    name: 'Lou',
    thumbnailPath: 'assets/models/lou/lou.png',
    variants: [
      GlassesVariant(name: 'Rich Black', variantId: 'rich-black', color: Colors.black),
      GlassesVariant(name: 'Cherry', variantId: 'cherry', color: Colors.red),
      GlassesVariant(name: 'Jelly', variantId: 'jelly', color: Colors.lightBlueAccent),
      GlassesVariant(name: 'Smoke', variantId: 'smoke', color: Color(0xFF555555)),
    ],
  ),
];

class ModelSelector extends StatefulWidget {
  final String selectedProduct;
  final String selectedVariant;
  final Function(String product, String variant) onVariantSelected;

  const ModelSelector({
    Key? key,
    required this.selectedProduct,
    required this.selectedVariant,
    required this.onVariantSelected,
  }) : super(key: key);

  @override
  State<ModelSelector> createState() => _ModelSelectorState();
}

class _ModelSelectorState extends State<ModelSelector> {
  late String _currentProduct;

  @override
  void initState() {
    super.initState();
    _currentProduct = widget.selectedProduct;
  }

  @override
  Widget build(BuildContext context) {
    final currentModel = mockModels.firstWhere((m) => m.id == _currentProduct, orElse: () => mockModels.first);
    final currentVariant = currentModel.variants.firstWhere((v) => v.variantId == widget.selectedVariant, orElse: () => currentModel.variants.first);
    
    final screenHeight = MediaQuery.of(context).size.height;
    final peekHeight = 130.0; // Collapsed height
    final minSize = peekHeight / screenHeight;

    return DraggableScrollableSheet(
      initialChildSize: minSize,
      minChildSize: minSize,
      maxChildSize: 0.5,
      snap: true,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            boxShadow: [
              BoxShadow(
                color: Color(0x4D000000), // rgba(0,0,0,0.30)
                offset: Offset(0, -2),
                blurRadius: 12,
              )
            ],
          ),
          child: ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            child: Container(
              color: Colors.black.withOpacity(0.85), // Darker fallback to replace blur
              child: CustomScrollView(
                  controller: scrollController,
                  slivers: [
                    SliverToBoxAdapter(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Drag Handle
                          Container(
                            margin: const EdgeInsets.only(top: 10, bottom: 12),
                            width: 40,
                            height: 4,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.4),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          // Collapsed Content Row
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16.0),
                            child: Row(
                              children: [
                                // Thumbnail
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Container(
                                    width: 72,
                                    height: 72,
                                    color: Colors.white.withOpacity(0.1),
                                    child: Image.asset(
                                      currentModel.thumbnailPath,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) =>
                                          const Icon(Icons.broken_image, color: Colors.white54),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                // Text Block
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        currentModel.name,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        currentVariant.name,
                                        style: TextStyle(
                                          color: Colors.white.withOpacity(0.65),
                                          fontSize: 13,
                                          fontWeight: FontWeight.w400,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          
                          // Expanded Area Below
                          Divider(color: Colors.white.withOpacity(0.1), height: 1),
                          const SizedBox(height: 24),
                          
                          // Model Carousel
                          SizedBox(
                            height: 100,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              itemCount: mockModels.length,
                              itemBuilder: (context, index) {
                                final model = mockModels[index];
                                final isSelected = model.id == _currentProduct;

                                return GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _currentProduct = model.id;
                                    });
                                    widget.onVariantSelected(model.id, model.variants.first.variantId);
                                  },
                                  child: Container(
                                    width: 100,
                                    margin: const EdgeInsets.only(right: 12),
                                    decoration: BoxDecoration(
                                      border: Border.all(
                                        color: isSelected ? Colors.white : Colors.transparent,
                                        width: 2,
                                      ),
                                      borderRadius: BorderRadius.circular(12),
                                      color: Colors.white.withOpacity(0.1),
                                    ),
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Image.asset(
                                          model.thumbnailPath,
                                          height: 50,
                                          fit: BoxFit.contain,
                                          errorBuilder: (context, error, stackTrace) =>
                                              const Icon(Icons.broken_image, color: Colors.white54),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          model.name,
                                          style: TextStyle(
                                            color: isSelected ? Colors.white : Colors.white70,
                                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 24),
                          
                          // Variants / Colors
                          Wrap(
                            spacing: 12,
                            runSpacing: 12,
                            alignment: WrapAlignment.center,
                            children: currentModel.variants.map((variant) {
                              final isSelected = widget.selectedProduct == currentModel.id &&
                                  widget.selectedVariant == variant.variantId;

                              return GestureDetector(
                                onTap: () {
                                  widget.onVariantSelected(currentModel.id, variant.variantId);
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: isSelected ? Colors.white : Colors.transparent,
                                      width: 2,
                                    ),
                                  ),
                                  child: CircleAvatar(
                                    backgroundColor: variant.color,
                                    radius: 16,
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 32), // Bottom padding
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
      },
    );
  }
}
