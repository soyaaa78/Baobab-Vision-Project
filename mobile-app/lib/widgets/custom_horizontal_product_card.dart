import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../screens/detail_screen.dart';
import 'custom_text.dart';
import '../models/productModel.dart';

// ignore: must_be_immutable
class CustomHorizontalProductCard extends StatefulWidget {
  final String productId;
  final String prodName;
  final String prodPrice;
  final int numStars;
  int quantity;
  final String description;
  final bool isCart;
  final bool isCheckout;
  final List<String> prodImages;
  final List<ColorOption> colorOptions;
  final List<LensOption> lensOptions;
  final String selectedColorName;
  final String selectedLensLabel;
  final String btnName;
  final VoidCallback? onAdd;
  final VoidCallback? onRemove;   // ✅ Added onRemove callback

  CustomHorizontalProductCard({
    super.key,
    required this.productId,
    required this.prodName,
    required this.prodPrice,
    required this.numStars,
    this.quantity = 1,
    this.description = '',
    this.isCart = false,
    this.isCheckout = false,
    required this.prodImages,
    required this.colorOptions,
    required this.lensOptions,
    required this.selectedColorName,
    required this.selectedLensLabel,
    this.btnName = 'Check Product',
    this.onAdd,                 // ✅ Added onAdd callback
    this.onRemove, 
  });

  @override
  State<CustomHorizontalProductCard> createState() => _CustomHorizontalProductCardState();
}

class _CustomHorizontalProductCardState extends State<CustomHorizontalProductCard> {
  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      margin: EdgeInsets.symmetric(vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: EdgeInsets.all(ScreenUtil().setWidth(12)),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.network(
                widget.prodImages[0],
                width: ScreenUtil().setWidth(80),
                height: ScreenUtil().setWidth(80),
                fit: BoxFit.cover,
              ),
            ),
            SizedBox(width: ScreenUtil().setWidth(12)),
            // Product Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Name
                  CustomText(
                    text: widget.prodName,
                    fontSize: ScreenUtil().setSp(15),
                    fontWeight: FontWeight.w700,
                    color: Colors.black,
                  ),
                  SizedBox(height: 4),
                  // Description (e.g. Frame in Black, Prescription Lenses)
                  Text(
                    'Frame in ${widget.selectedColorName}, ${widget.selectedLensLabel}',
                    style: TextStyle(
                      fontSize: ScreenUtil().setSp(13),
                      color: Colors.black54,
                      height: 1.3,
                    ),
                  ),
                  SizedBox(height: 6),
                  // Price + Quantity Controls
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      CustomText(
                        text: widget.prodPrice,
                        fontSize: ScreenUtil().setSp(15),
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                      ),
                      Row(
                        children: [
                          GestureDetector(
                            onTap: widget.onRemove,  // ✅ Call onRemove callback
                            child: Icon(Icons.remove, size: 18, color: BLACK_COLOR),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            child: CustomText(
                              text: '${widget.quantity}',
                              fontSize: ScreenUtil().setSp(14),
                            ),
                          ),
                          GestureDetector(
                            onTap: widget.onAdd,  // ✅ Call onAdd callback
                            child: Icon(Icons.add, size: 18, color: BLACK_COLOR),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
