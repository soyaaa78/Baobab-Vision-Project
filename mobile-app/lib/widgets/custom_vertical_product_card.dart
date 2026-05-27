import 'package:baobab_vision_project/models/productModel.dart';
import '../widgets/custom_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../screens/detail_screen.dart';

class CustomVerticalProductCard extends StatefulWidget {
  final String prodName;
  final String prodPrice;
  final double numStars;
  final int quantity;
  final String description;
  final List<String> prodImages;
  final String productId;
  final List<ColorOption> colorOptions;
  final List<LensOption> lensOptions;
  final String selectedColorName;
  final String selectedLensLabel;

  CustomVerticalProductCard({
    super.key,
    required this.prodName,
    required this.prodPrice,
    required numStars, // accept int or double
    this.quantity = 1,
    this.description = '',
    required this.prodImages,
    required this.productId,
    required this.colorOptions,
    required this.lensOptions,
    required this.selectedColorName,
    required this.selectedLensLabel,
  }) : numStars = numStars.toDouble(); // automatically convert to double

  @override
  _CustomVerticalProductCardState createState() =>
      _CustomVerticalProductCardState();
}

class _CustomVerticalProductCardState extends State<CustomVerticalProductCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DetailScreen(
              productId: widget.productId,
              prodName: widget.prodName,
              prodSize: '',
              prodPrice: widget.prodPrice,
              numStars: widget.numStars.toInt(), // DetailScreen expects int
              quantity: widget.quantity,
              description: widget.description,
              prodImages: widget.prodImages,
              colorOptions: widget.colorOptions,
              lensOptions: widget.lensOptions,
            ),
          ),
        );
      },
      child: AnimatedContainer(
        duration: Duration(milliseconds: 150),
        curve: Curves.easeOut,
        transform: Matrix4.identity()..scale(_isPressed ? 0.96 : 1.0),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: _isPressed ? 6 : 3,
              spreadRadius: 0,
              offset: Offset(0, _isPressed ? 2 : 1),
            ),
          ],
        ),
        child: Card(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          child: Container(
            width: ScreenUtil().setWidth(150),
            constraints: BoxConstraints(
              minHeight: ScreenUtil().setHeight(200),
              maxHeight: ScreenUtil().setHeight(200),
            ),
            padding: EdgeInsets.symmetric(
              horizontal: ScreenUtil().setWidth(12),
              vertical: ScreenUtil().setHeight(12),
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(15),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.max,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Image Container
                Container(
                  height: ScreenUtil().setHeight(90),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    gradient: LinearGradient(
                      colors: [Colors.grey.shade200, Colors.white],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: widget.prodImages[0].startsWith('http')
                        ? Image.network(
                            widget.prodImages[0],
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Icon(
                                Icons.broken_image,
                                size: 40,
                                color: Colors.grey),
                          )
                        : Image.asset(widget.prodImages[0], fit: BoxFit.cover),
                  ),
                ),
                SizedBox(height: ScreenUtil().setHeight(10)),

                // Flexible Product Name
                Flexible(
                  child: CustomText(
                    text: widget.prodName,
                    fontSize: ScreenUtil().setSp(14),
                    color: BLACK_COLOR,
                    fontWeight: FontWeight.w700,
                    fontFamily: 'Montserrat',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                  ),
                ),
                SizedBox(height: ScreenUtil().setHeight(8)),

                // Price
                CustomText(
                  text: widget.prodPrice,
                  fontSize: ScreenUtil().setSp(12),
                  color: BLACK_COLOR,
                  fontWeight: FontWeight.w500,
                ),
                SizedBox(height: ScreenUtil().setHeight(8)),

                // Star Rating with half-star support
                Builder(builder: (context) {
                  final double rawRating = widget.numStars.clamp(0, 5);
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      final double remaining = rawRating - index;
                      IconData icon;
                      Color color;
                      if (remaining >= 1) {
                        icon = Icons.star;
                        color = Colors.amber;
                      } else if (remaining >= 0.5) {
                        icon = Icons.star_half;
                        color = Colors.amber;
                      } else {
                        icon = Icons.star_border;
                        color = Colors.grey.shade400;
                      }
                      return Icon(icon, size: 14.sp, color: color);
                    }),
                  );
                }),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
