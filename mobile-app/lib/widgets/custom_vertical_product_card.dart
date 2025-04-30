import '../widgets/custom_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../screens/detail_screen.dart';

class CustomVerticalProductCard extends StatelessWidget {
  final String prodName;
  final String prodSize;
  final String prodPrice;
  final int numStars;
  final int quantity;
  final String description;
  final List<String> prodImages;
  final String productId; 

  const CustomVerticalProductCard({
    super.key,
    required this.prodName,
    required this.prodSize,
    required this.prodPrice,
    required this.numStars,
    this.quantity = 1,
    this.description = '',
    required this.prodImages,
    required this.productId,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailScreen(
                prodName: prodName,
                prodSize: prodSize,
                prodPrice: prodPrice,
                numStars: numStars,
                quantity: quantity,
                description: description,
                prodImages: prodImages,
              ),
            ),
          );
        },
        child: Container(
          width: ScreenUtil().setWidth(140),  // Adjust width as needed
          constraints: BoxConstraints(
            minHeight: ScreenUtil().setHeight(190), // Ensure card height is constrained
            maxHeight: ScreenUtil().setHeight(190), // Max height
          ),
          padding: EdgeInsets.symmetric(
            horizontal: ScreenUtil().setWidth(15),
            vertical: ScreenUtil().setHeight(15),
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,  // Prevent overflow and limit size
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // 🖼 Dynamic Image Handling (Asset or Network)
              prodImages[0].startsWith('http')
    ? Image.network(
        prodImages[0],  // 👈 first item in the list
        height: ScreenUtil().setHeight(80),
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) =>
            Icon(Icons.broken_image, size: 40),
      )
    : Image.asset(
        prodImages[0],  // 👈 first item in the list
        height: ScreenUtil().setHeight(80),
        fit: BoxFit.cover,
      ),

              SizedBox(height: ScreenUtil().setHeight(5)),

              // 🏷 Product Name
              CustomText(
                text: prodName,
                fontSize: ScreenUtil().setSp(15),
                color: BLACK_COLOR,
                fontWeight: FontWeight.w900,
              ),
              SizedBox(height: ScreenUtil().setHeight(3)),

              // 📦 Stock Info
              CustomText(
                text: prodSize,
                fontSize: ScreenUtil().setSp(10),
                color: Colors.black45,
              ),
              SizedBox(height: ScreenUtil().setHeight(5)),

              // 💰 Price
              CustomText(
                text: prodPrice,
                fontSize: ScreenUtil().setSp(17),
                color: BLACK_COLOR,
              ),

              // ⭐ Star Rating
              SizedBox(height: 4.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  numStars,
                  (index) => Icon(Icons.star, size: 12.sp, color: Colors.amber),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
