import 'package:flutter/material.dart';
import '../screens/rate_input_screen.dart';

class ExpandableRateOrderCard extends StatefulWidget {
  final String orderId;
  final String backendOrderId;
  final List<Map<String, dynamic>> products;
  final String deliveryMethod;
  final String thirdPartyDelivery;
  final String status;
  final DateTime? orderDate;
  final VoidCallback? onRated;

  const ExpandableRateOrderCard({
    super.key,
    required this.orderId,
    required this.backendOrderId,
    required this.products,
    required this.deliveryMethod,
    required this.thirdPartyDelivery,
    required this.status,
    this.orderDate,
    this.onRated,
  });

  @override
  State<ExpandableRateOrderCard> createState() =>
      _ExpandableRateOrderCardState();
}

class _ExpandableRateOrderCardState extends State<ExpandableRateOrderCard>
    with SingleTickerProviderStateMixin {
  bool _isExpanded = false;
  late AnimationController _animationController;
  late Animation<double> _iconRotationAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _iconRotationAnimation = Tween<double>(
      begin: 0.0,
      end: 0.5,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleExpansion() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  double get _totalAmount {
    return widget.products.fold(0.0, (sum, product) {
      final price =
          double.tryParse(product['prodPrice']?.toString() ?? '0') ?? 0.0;
      final quantity = product['quantity'] ?? 1;
      return sum + (price * quantity);
    });
  }

  int get _totalItems {
    return widget.products.fold(0, (sum, product) {
      return sum + (product['quantity'] ?? 1) as int;
    });
  }

  String get _primaryProductName {
    if (widget.products.isEmpty) return '';
    return widget.products.first['prodName']?.toString() ?? '';
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompact = constraints.maxWidth < 360;
        final borderRadius = BorderRadius.circular(20);
        final headerPadding = EdgeInsets.all(isCompact ? 12 : 16);
        final summarySpacing = isCompact ? 8.0 : 12.0;

        return Card(
          elevation: 6,
          shape: RoundedRectangleBorder(
            borderRadius: borderRadius,
          ),
          margin: EdgeInsets.symmetric(
            vertical: 8,
            horizontal: isCompact ? 8 : 12,
          ),
          shadowColor: Colors.black26,
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.white, Colors.grey.shade50],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: borderRadius,
            ),
            child: Column(
              children: [
                InkWell(
                  onTap: _toggleExpansion,
                  borderRadius: borderRadius,
                  child: Padding(
                    padding: headerPadding,
                    child: Column(
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          widget.orderId,
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: isCompact ? 14 : 16,
                                            color: Colors.black87,
                                          ),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      SizedBox(width: isCompact ? 6 : 8),
                                      Flexible(
                                        child: Container(
                                          padding: EdgeInsets.symmetric(
                                            horizontal: isCompact ? 6 : 8,
                                            vertical: isCompact ? 2 : 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: Colors.green.shade700,
                                            borderRadius:
                                                BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            'Completed',
                                            style: TextStyle(
                                              fontSize: isCompact ? 11 : 12,
                                              fontWeight: FontWeight.w600,
                                              color: Colors.white,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (widget.orderDate != null)
                                    Padding(
                                      padding: EdgeInsets.only(
                                          top: isCompact ? 4 : 6),
                                      child: Text(
                                        _formatDate(widget.orderDate!),
                                        style: TextStyle(
                                          fontSize: isCompact ? 11 : 12,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            AnimatedBuilder(
                              animation: _iconRotationAnimation,
                              builder: (context, child) {
                                return Transform.rotate(
                                  angle: _iconRotationAnimation.value * 3.14159,
                                  child: Icon(
                                    Icons.expand_more,
                                    size: 24,
                                    color: Colors.grey[600],
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                        SizedBox(height: summarySpacing),
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                '$_totalItems item${_totalItems > 1 ? 's' : ''}',
                                style: TextStyle(
                                  fontSize: isCompact ? 13 : 14,
                                  color: Colors.grey[700],
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                '₱${_totalAmount.toStringAsFixed(2)}',
                                style: TextStyle(
                                  fontSize: isCompact ? 15 : 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                                textAlign: TextAlign.end,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: isCompact ? 6 : 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildIconTextRow(
                              Icons.local_shipping,
                              widget.deliveryMethod,
                              isCompact,
                              maxLines: 2,
                            ),
                            if (widget.thirdPartyDelivery.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: _buildIconTextRow(
                                  Icons.delivery_dining,
                                  widget.thirdPartyDelivery,
                                  isCompact,
                                  maxLines: 2,
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                AnimatedCrossFade(
                  duration: const Duration(milliseconds: 300),
                  crossFadeState: _isExpanded
                      ? CrossFadeState.showSecond
                      : CrossFadeState.showFirst,
                  firstChild: const SizedBox.shrink(),
                  secondChild: Container(
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: const BorderRadius.only(
                        bottomLeft: Radius.circular(20),
                        bottomRight: Radius.circular(20),
                      ),
                    ),
                    child: Column(
                      children: [
                        const Divider(height: 1, thickness: 1),
                        ...widget.products.map(
                            (product) => _buildProductItem(product, isCompact)),
                        Padding(
                          padding: EdgeInsets.all(isCompact ? 12 : 16),
                          child: SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.orange,
                                foregroundColor: Colors.white,
                                padding: EdgeInsets.symmetric(
                                  vertical: isCompact ? 10 : 12,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                elevation: 3,
                                textStyle: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: isCompact ? 15 : 16,
                                ),
                              ),
                              onPressed: () async {
                                await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => RateInputScreen(
                                      productName: _primaryProductName,
                                      orderId: widget.backendOrderId,
                                    ),
                                  ),
                                );
                                if (widget.onRated != null) {
                                  widget.onRated!();
                                }
                              },
                              icon: Icon(
                                Icons.star_rate,
                                size: isCompact ? 18 : 20,
                              ),
                              label: const Text('Rate This Order'),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProductItem(Map<String, dynamic> product, bool isCompact) {
    final prodImages = List<String>.from(product['prodImages'] ?? []);
    final prodName = product['prodName']?.toString() ?? '';
    final quantity = product['quantity'] ?? 1;
    final prodPrice = product['prodPrice']?.toString() ?? '';
    final selectedColorName = product['selectedColorName']?.toString() ?? '';
    final selectedLensLabel = product['selectedLensLabel']?.toString() ?? '';

    final total = (double.tryParse(prodPrice) ?? 0.0) * quantity;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 12 : 16,
        vertical: isCompact ? 10 : 12,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product Image
          Container(
            height: isCompact ? 52 : 60,
            width: isCompact ? 52 : 60,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Colors.grey[200],
              image: prodImages.isNotEmpty
                  ? DecorationImage(
                      image: NetworkImage(prodImages[0]),
                      fit: BoxFit.cover,
                    )
                  : null,
            ),
            child: prodImages.isEmpty
                ? Icon(Icons.image_not_supported,
                    size: 24, color: Colors.grey[500])
                : null,
          ),

          SizedBox(width: isCompact ? 10 : 12),

          // Product Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  prodName,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: isCompact ? 13 : 14,
                    color: Colors.black87,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                if (selectedColorName.isNotEmpty)
                  Text(
                    'Color: $selectedColorName',
                    style: TextStyle(
                      fontSize: isCompact ? 11 : 12,
                      color: Colors.grey[600],
                    ),
                  ),
                if (selectedLensLabel.isNotEmpty)
                  Text(
                    'Lens: $selectedLensLabel',
                    style: TextStyle(
                      fontSize: isCompact ? 11 : 12,
                      color: Colors.grey[600],
                    ),
                  ),
                SizedBox(height: isCompact ? 4 : 6),
                Row(
                  children: [
                    Text(
                      'Qty: $quantity',
                      style: TextStyle(
                        fontSize: isCompact ? 11 : 12,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey[700],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        '₱${total.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: isCompact ? 13 : 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                        textAlign: TextAlign.end,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIconTextRow(
    IconData icon,
    String text,
    bool isCompact, {
    int maxLines = 2,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: isCompact ? 14 : 16,
          color: Colors.grey[600],
        ),
        SizedBox(width: isCompact ? 4 : 6),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: isCompact ? 11 : 12,
              color: Colors.grey[600],
            ),
            maxLines: maxLines,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date).inDays;

    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Yesterday';
    } else if (difference < 7) {
      return '$difference days ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}
