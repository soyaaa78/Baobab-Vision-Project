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
  final String prodImage; 

  const CustomVerticalProductCard({
    super.key,
    required this.prodName,
    required this.prodSize,
    required this.prodPrice,
    required this.numStars,
    this.quantity = 1,
    this.description = '',
    required this.prodImage, 
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      elevation: 1,
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) {
                return DetailScreen(
                  prodName: prodName,
                  prodSize: prodSize,
                  prodPrice: prodPrice,
                  numStars: numStars,
                  quantity: quantity,
                  description: description,
                  prodImage: prodImage,
                );
              },
            ),
          );
        },
        child: Container(
          width: ScreenUtil().setWidth(140),
          height: ScreenUtil().setHeight(183),
          padding: EdgeInsets.symmetric(
            horizontal: ScreenUtil().setWidth(15),
            vertical: ScreenUtil().setHeight(15),
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Dynamic Product Image
              Image.asset(
                prodImage, // Dynamic product image
                height: ScreenUtil().setHeight(80),
                fit: BoxFit.cover,
              ),
              SizedBox(height: ScreenUtil().setHeight(5)),
              CustomText(
                text: prodName,
                fontSize: ScreenUtil().setSp(15),
                color: BLACK_COLOR,
                fontWeight: FontWeight.w900,
              ),
              SizedBox(height: ScreenUtil().setHeight(3)),
              CustomText(
                text: prodSize,
                fontSize: ScreenUtil().setSp(10),
                color: Colors.black45,
              ),
              SizedBox(height: ScreenUtil().setHeight(5)),
              CustomText(
                text: prodPrice,
                fontSize: ScreenUtil().setSp(17),
                color: BLACK_COLOR,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
