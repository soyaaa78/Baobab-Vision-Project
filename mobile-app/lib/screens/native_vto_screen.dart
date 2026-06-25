import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../models/productModel.dart';
import '../services/ar_session_service.dart';
import '../services/model_loader_service.dart';
import '../services/auth_storage.dart';
import '../widgets/glasses_renderer.dart';
import '../widgets/cart_animation_button.dart';
import '../screens/detail_screen.dart' show addToCart;
import '../constants.dart';

class NativeVtoScreen extends StatefulWidget {
  final Product product;
  final ColorOption initialColor;
  final List<Product>? allProducts;

  const NativeVtoScreen({
    Key? key,
    required this.product,
    required this.initialColor,
    this.allProducts,
  }) : super(key: key);

  @override
  State<NativeVtoScreen> createState() => _NativeVtoScreenState();
}

class _NativeVtoScreenState extends State<NativeVtoScreen> {
  final ArSessionService _arSession = ArSessionService();
  final ModelLoaderService _modelLoader = ModelLoaderService();

  late Product _activeProduct;
  late ColorOption _activeColor;
  bool _cameraReady = false;
  bool _isSheetExpanded = false;

  String? _currentGlbPath;
  bool _isLoadingModel = false;
  bool _isExiting = false;

  @override
  void initState() {
    super.initState();
    _activeProduct = widget.product;
    _activeColor = widget.initialColor;
    _start();
  }

  Future<void> _start() async {
    _arSession.onStateChanged = () {
      if (mounted) setState(() {});
    };

    final url = _activeColor.model3dUrl ?? _activeProduct.model3dUrl;
    if (url != null && url.isNotEmpty) {
      _loadModelUrl(url);
    }

    final supported = await ArSessionService.isFaceTrackingSupported();
    if (!mounted) return;

    if (!supported) return;

    await _arSession.start();
    if (!mounted) return;

    setState(() {
      _cameraReady = true;
    });

    _arSession.faceAnchorStream.listen((anchorData) {
      // Stream subscription keeps GlassesRenderer alive with fresh data.
    });
  }

  @override
  void dispose() {
    _arSession.stop();
    _modelLoader.clearCache();
    super.dispose();
  }

  Future<void> _loadModelUrl(String url) async {
    setState(() {
      _isLoadingModel = true;
    });
    try {
      final path = await _modelLoader.loadModelFromUrl(url);
      if (mounted) {
        setState(() {
          _currentGlbPath = path;
          _isLoadingModel = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingModel = false;
        });
      }
    }
  }

  void _onColorSelected(ColorOption color) {
    if (_activeColor.id == color.id) return;
    setState(() {
      _activeColor = color;
      _currentGlbPath = null; // Clear previous model immediately
    });
    final url = color.model3dUrl ?? _activeProduct.model3dUrl;
    if (url != null && url.isNotEmpty) {
      _loadModelUrl(url);
    }
  }

  void _onProductSelected(Product product) {
    if (_activeProduct.id == product.id) return;
    setState(() {
      _activeProduct = product;
      _activeColor = product.colorOptions.isNotEmpty ? product.colorOptions[0] : _activeColor;
      _currentGlbPath = null;
    });
    final url = _activeColor.model3dUrl ?? _activeProduct.model3dUrl;
    if (url != null && url.isNotEmpty) {
      _loadModelUrl(url);
    }
  }

  Widget _buildProductSelector() {
    if (widget.allProducts == null) {
      return const SizedBox.shrink();
    }

    final vtoProducts = widget.allProducts!.where((p) {
      final hasProductModel = p.model3dUrl != null && p.model3dUrl!.isNotEmpty;
      final hasColorModel = p.colorOptions.any((c) => c.model3dUrl != null && c.model3dUrl!.isNotEmpty);
      return hasProductModel || hasColorModel;
    }).toList();

    if (vtoProducts.length <= 1) {
      return const SizedBox.shrink();
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: Text(
            'Select Style',
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.w600,
              color: BLACK_COLOR,
            ),
          ),
        ),
        SizedBox(
          height: 105,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: vtoProducts.length,
            itemBuilder: (context, index) {
              final product = vtoProducts[index];
              final isSelected = _activeProduct.id == product.id;
              final imageUrl = product.imageUrls.isNotEmpty ? product.imageUrls.first : '';
              
              return GestureDetector(
                onTap: () => _onProductSelected(product),
                child: Container(
                  width: 80,
                  margin: const EdgeInsets.only(right: 12),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        height: 80,
                        width: 80,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? const Color(0xFFEAB676) : Colors.transparent,
                            width: 4,
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: imageUrl.startsWith('http')
                              ? Image.network(imageUrl, fit: BoxFit.cover)
                              : Image.asset(imageUrl, fit: BoxFit.cover),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        product.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: isSelected ? BLACK_COLOR : Colors.grey[600],
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                          fontFamily: 'Rubik',
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildColorSelector() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: _activeProduct.colorOptions.map((colorOption) {
          final isSelected = _activeColor.id == colorOption.id;
          return GestureDetector(
            onTap: () => _onColorSelected(colorOption),
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color:
                      isSelected ? const Color(0xFFEAB676) : Colors.transparent,
                  width: 2,
                ),
              ),
              child: ClipOval(
                child: colorOption.type == 'swatch'
                    ? Image.network(
                        colorOption.swatchUrl,
                        width: 32,
                        height: 32,
                        fit: BoxFit.cover,
                      )
                    : Container(
                        width: 32,
                        height: 32,
                        color: Color(int.parse(
                            colorOption.colors[0].replaceFirst('#', '0xff'))),
                      ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final controller = _arSession.cameraController;
    final isInitialized = controller != null && controller.value.isInitialized;

    Size? previewSize;

    if (isInitialized && controller.value.previewSize != null) {
      final p = controller.value.previewSize!;
      previewSize = Size(p.height, p.width);
    }

    if (!_cameraReady || !isInitialized || previewSize == null) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: const Center(
          child: CircularProgressIndicator(color: Colors.white),
        ),
      );
    }

    return PopScope(
      canPop: true,
      onPopInvoked: (didPop) {
        if (mounted) setState(() => _isExiting = true);
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        body: Stack(
          fit: StackFit.expand,
          children: [
            // Live camera feed
            FittedBox(
              fit: BoxFit.cover,
              child: SizedBox(
                width: previewSize.width,
                height: previewSize.height,
                child: CameraPreview(controller),
              ),
            ),

            // Proof of Concept 3D Glasses Rendering
            if (!_isExiting && _currentGlbPath != null)
              GlassesRenderer(
                glbPath: _currentGlbPath!,
                faceDataStream: _arSession.faceAnchorStream,
                previewSize: previewSize,
              ),

            if (_isLoadingModel)
              const Center(
                  child: CircularProgressIndicator(color: Colors.white)),

            // Floating back button
            Positioned(
              top: MediaQuery.of(context).padding.top + 10,
              left: 16,
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.black45,
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon:
                      const Icon(Icons.keyboard_backspace, color: Colors.white),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
              ),
            ),

            // Collapsible product sheet
            Align(
              alignment: Alignment.bottomCenter,
              child: GestureDetector(
                onVerticalDragUpdate: (details) {
                  if (details.delta.dy < -10 && !_isSheetExpanded) {
                    setState(() => _isSheetExpanded = true);
                  } else if (details.delta.dy > 10 && _isSheetExpanded) {
                    setState(() => _isSheetExpanded = false);
                  }
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeOutCubic,
                  margin: EdgeInsets.fromLTRB(16, 0, 16, MediaQuery.of(context).padding.bottom + 20),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Drag Handle for expanding/collapsing
                      if (widget.allProducts != null && widget.allProducts!.where((p) => (p.model3dUrl != null && p.model3dUrl!.isNotEmpty) || p.colorOptions.any((c) => c.model3dUrl != null && c.model3dUrl!.isNotEmpty)).length > 1)
                        Center(
                          child: GestureDetector(
                            onTap: () => setState(() => _isSheetExpanded = !_isSheetExpanded),
                            child: Container(
                              width: 40,
                              height: 5,
                              margin: const EdgeInsets.only(bottom: 16),
                              decoration: BoxDecoration(
                                color: Colors.grey[300],
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                          ),
                        ),

                      // Expanded Content (Product Carousel)
                      if (_isSheetExpanded && widget.allProducts != null && widget.allProducts!.where((p) => (p.model3dUrl != null && p.model3dUrl!.isNotEmpty) || p.colorOptions.any((c) => c.model3dUrl != null && c.model3dUrl!.isNotEmpty)).length > 1)
                        _buildProductSelector(),

                      // Product Info
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                              children: [
                                Text(
                                  _activeProduct.name,
                                  style: TextStyle(
                                    fontSize: 20.sp,
                                    fontWeight: FontWeight.bold,
                                    color: BLACK_COLOR,
                                    fontFamily: 'Rubik',
                                  ),
                                ),
                                SizedBox(width: 8),
                                Text(
                                  'in ${_activeColor.name}',
                                  style: TextStyle(
                                    fontSize: 12.sp,
                                    color: Colors.grey[600],
                                    fontWeight: FontWeight.w500,
                                  ),
                                )
                              ]),
                          Text(
                            '₱${_activeProduct.price.toStringAsFixed(2)}',
                            style: TextStyle(
                              fontSize: 18.sp,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF6F5844),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Swatches and Buy Button Row
                      Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: _buildColorSelector(),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            flex: 2,
                            child: CartAnimationButton(
                              label: 'Add to Cart',
                              onPressed: () async {
                                final token = await AuthStorage.getToken();
                                if (token != null) {
                                  final lensId =
                                      _activeProduct.lensOptions.isNotEmpty
                                          ? _activeProduct.lensOptions.first.id
                                          : '';
                                  await addToCart(
                                    token,
                                    _activeProduct.id,
                                    1,
                                    _activeColor.id,
                                    lensId,
                                    null,
                                  );
                                } else {
                                  print('User is not logged in!');
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
