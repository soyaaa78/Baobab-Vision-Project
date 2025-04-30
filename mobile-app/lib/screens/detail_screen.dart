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
  final List<String> prodImages; // Updated from String

  const DetailScreen({
    super.key,
    required this.prodName,
    required this.prodSize,
    required this.prodPrice,
    required this.numStars,
    required this.quantity,
    this.description = 'Lorem ipsum',
    required this.prodImages,
  });

  @override
  _DetailScreenState createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen> {
  late PageController _pageController;
  int _selectedImageIndex = 0;

  String selectedChoice = 'Built-in UV400 Lenses (FREE)';
  List<String> choices = [
    'Built-in UV400 Lenses (FREE)',
    'Polarized Lenses (+PHP300)',
    'Photochromic Lenses (+PHP300)'
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      body: SafeArea(
        child: Padding(
  padding: const EdgeInsets.all(16.0),
  child: SingleChildScrollView(
    child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ====== Main Image Carousel with Thumbnails ======
              Column(
                children: [
                  Stack(
                    children: [
                      SizedBox(
                        height: ScreenUtil().setHeight(280),
                        width: double.infinity,
                        child: PageView.builder(
                          controller: _pageController,
                          itemCount: widget.prodImages.length,
                          onPageChanged: (index) {
                            setState(() {
                              _selectedImageIndex = index;
                            });
                          },
                          itemBuilder: (context, index) {
                            return Image.network(
                              widget.prodImages[index],
                              fit: BoxFit.cover,
                              width: double.infinity,
                            );
                          },
                        ),
                      ),
                      Positioned(
                        top: ScreenUtil().setHeight(10),
                        left: ScreenUtil().setWidth(10),
                        child: InkWell(
                          onTap: () => Navigator.pop(context),
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

                  SizedBox(height: 10),

                  // ====== Thumbnails ======
                  SingleChildScrollView(
  scrollDirection: Axis.horizontal,
  child: Row(
    children: List.generate(widget.prodImages.length, (index) {
      return GestureDetector(
        onTap: () {
          _pageController.animateToPage(
            index,
            duration: Duration(milliseconds: 300),
            curve: Curves.easeInOut,
          );
          setState(() {
            _selectedImageIndex = index;
          });
        },
        child: Container(
          margin: EdgeInsets.symmetric(horizontal: 5),
          padding: EdgeInsets.all(2),
          decoration: BoxDecoration(
            border: Border.all(
              color: _selectedImageIndex == index ? BLACK_COLOR : Colors.transparent,
              width: 2,
            ),
            borderRadius: BorderRadius.circular(8),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(
              widget.prodImages[index],
              height: 60,
              width: 60,
              fit: BoxFit.cover,
            ),
          ),
        ),
      );
    }),
  ),
),

                ],
              ),

              // ====== Text Info Section ======
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

              // ====== Buttons ======
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => VirtualTryOnScreen()),
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
                          MaterialPageRoute(builder: (context) => CartScreen()),
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
      )
    );
  }

  Widget _colorDot(Color color) {
    return CircleAvatar(
      radius: 12,
      backgroundColor: color,
    );
  }
}
