import 'package:baobab_vision_project/screens/cart_screen.dart';
import 'package:baobab_vision_project/screens/vto_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';

class DetailScreen extends StatefulWidget {
  final String prodName;
  final String prodSize;
  final String prodPrice;
  final int numStars;
  final int quantity;
  final String description;
  final String prodImage;

  const DetailScreen({
    super.key,
    required this.prodName,
    required this.prodSize,
    required this.prodPrice,
    required this.numStars,
    required this.quantity,
    this.description = 'Lorem ipsum',
    required this.prodImage,
  });

  @override
  _DetailScreenState createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen> {
  String selectedChoice = 'Built-in UV400 Lenses (FREE)';
  List<String> choices = ['Built-in UV400 Lenses (FREE)', 'Polarized Lenses (+PHP300)', 'Photochromic Lenses (+PHP300)'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Image and Rating
              Stack(
                children: [
                  Image.asset(
                    widget.prodImage,
                    width: double.infinity,
                    height: ScreenUtil().setHeight(280),
                    fit: BoxFit.cover,
                  ),
                  Positioned(
                    top: ScreenUtil().setHeight(10),
                    left: ScreenUtil().setWidth(10),
                    child: InkWell(
                      onTap: () {
                        Navigator.pop(context);
                      },
                      child: Icon(
                        Icons.keyboard_backspace,
                        size: ScreenUtil().setSp(40),
                      ),
                    ),
                  ),
                  Positioned(
                    top: ScreenUtil().setHeight(10),
                    right: ScreenUtil().setWidth(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.yellow[700],
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.star, color: Colors.white, size: 16),
                          SizedBox(width: 4),
                          CustomText(
                            text: "${widget.numStars}",
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: ScreenUtil().setSp(14),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: ScreenUtil().setHeight(20)),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  CustomText(
                    text: widget.prodName,
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: ScreenUtil().setSp(24),
                  ),
                  CustomText(
                    text: widget.prodPrice,
                    color: BLACK_COLOR,
                    fontWeight: FontWeight.bold,
                    fontSize: ScreenUtil().setSp(24),
                  ),
                ],
              ),
              SizedBox(height: ScreenUtil().setHeight(5)),
              CustomText(
                text: 'Available color versions:',
                fontSize: ScreenUtil().setSp(15),
                color: Colors.black,
              ),
              SizedBox(height: ScreenUtil().setHeight(8)),
              Row(
                children: [
                  _colorDot(BLACK_COLOR),
                  const SizedBox(width: 8),
                  _colorDot(EYEWEARCOLOR1),
                  const SizedBox(width: 8),
                  _colorDot(EYEWEARCOLOR2),
                ],
              ),
              SizedBox(height: ScreenUtil().setHeight(16)),
              CustomText(
                text: 'Select an option:',
                fontSize: ScreenUtil().setSp(15),
                color: Colors.black,
                fontWeight: FontWeight.bold,
              ),
              SizedBox(height: ScreenUtil().setHeight(8)),
              DropdownButton<String>(
                value: selectedChoice,
                isExpanded: true,
                dropdownColor: WHITE_COLOR,
                onChanged: (String? newValue) {
                  setState(() {
                    selectedChoice = newValue!;
                  });
                },
                items: choices.map<DropdownMenuItem<String>>((String value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
              ),
              SizedBox(height: ScreenUtil().setHeight(16)),
              CustomText(
                text: "Description",
                fontSize: ScreenUtil().setSp(15),
                color: Colors.black,
                fontWeight: FontWeight.bold,
              ),
              SizedBox(height: ScreenUtil().setHeight(5)),
              CustomText(
                text: widget.description,
                fontSize: ScreenUtil().setSp(12),
              ),
              SizedBox(height: ScreenUtil().setHeight(16)),
              Spacer(),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                    Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => VirtualTryOnScreen()), // Navigate to ProfileScreen
                    );  
                    },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: BLACK_COLOR,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        minimumSize: const Size(double.infinity, 50),
                      ),
                      child: CustomText(
                        text: 'Virtual Try-on',
                        fontSize: ScreenUtil().setSp(15),
                        //fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                      Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => CartScreen()), // Navigate to ProfileScreen
                      );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: BLACK_COLOR,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        minimumSize: const Size(double.infinity, 50),
                      ),
                      child: CustomText(
                        text: 'Add to Cart',
                        fontSize: ScreenUtil().setSp(15),
                        //fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _colorDot(Color color) {
    return CircleAvatar(
      radius: 12,
      backgroundColor: color,
    );
  }
}
