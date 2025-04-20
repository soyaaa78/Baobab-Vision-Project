import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../screens/detail_screen.dart';
import 'custom_text.dart';

// ignore: must_be_immutable
class CustomHorizontalProductCard extends StatefulWidget {
  final String prodName;
  final String prodSize;
  final String prodPrice;
  final String btnName;
  final int numStars;
  int quantity;
  final String description;
  final bool isCart;
  final bool isCheckout;
  final String prodImage;

  CustomHorizontalProductCard({
    super.key,
    required this.prodName,
    required this.prodSize,
    required this.prodPrice,
    this.btnName = 'Check Product',
    required this.numStars,
    this.quantity = 1,
    this.description = '',
    this.isCart = false,
    this.isCheckout = false,
    required this.prodImage,
  });

  @override
  State<CustomHorizontalProductCard> createState() =>
      _CustomHorizontalProductCardState();
}

class _CustomHorizontalProductCardState
    extends State<CustomHorizontalProductCard> {
  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      child: GestureDetector(
        onTap: () {},
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: ScreenUtil().setWidth(15),
            vertical: ScreenUtil().setHeight(15),
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Dynamic Product Image
             ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Image.asset(
            widget.prodImage, // Dynamic product image
            width: ScreenUtil().setWidth(88),
            height: ScreenUtil().setHeight(88),
            fit: BoxFit.cover,
           ),
          ),

              SizedBox(width: ScreenUtil().setWidth(10)),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CustomText(
                    text: widget.prodName,
                    fontSize: ScreenUtil().setSp(15),
                    color: Colors.black,
                    fontWeight: FontWeight.w900,
                  ),
                  SizedBox(height: ScreenUtil().setHeight(3)),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      CustomText(
                        text: "Quantity:",
                        fontSize: ScreenUtil().setSp(12),
                      ),
                      SizedBox(width: ScreenUtil().setWidth(10)),
                      GestureDetector(
                        onTap: () => setState(() {
                          if (widget.quantity > 1) widget.quantity--;
                        }),
                        child: Icon(
                          Icons.remove,
                          color: NU_BLUE,
                          size: ScreenUtil().setSp(12),
                        ),
                      ),
                      SizedBox(width: ScreenUtil().setWidth(10)),
                      CustomText(
                        text: '${widget.quantity}',
                        fontSize: ScreenUtil().setSp(12),
                      ),
                      SizedBox(width: ScreenUtil().setWidth(10)),
                      GestureDetector(
                        onTap: () => setState(() {
                          widget.quantity++;
                        }),
                        child: Icon(
                          Icons.add,
                          color: NU_BLUE,
                          size: ScreenUtil().setSp(12),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: ScreenUtil().setHeight(5)),
                  CustomText(
                    text: widget.prodSize,
                    fontSize: ScreenUtil().setSp(10),
                    color: Colors.black45,
                  ),
                  SizedBox(height: ScreenUtil().setHeight(5)),
                  CustomText(
                    text: widget.prodPrice,
                    fontSize: ScreenUtil().setSp(17),
                    color: BLACK_COLOR,
                  ),
                  SizedBox(height: ScreenUtil().setHeight(5)),
                  widget.isCheckout
                      ? const SizedBox()
                      : SizedBox(
                          width: ScreenUtil().setWidth(200),
                          height: ScreenUtil().setHeight(30),
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.push(context, MaterialPageRoute(
                                builder: (context) {
                                  return DetailScreen(
                                    prodName: widget.prodName,
                                    prodSize: widget.prodSize,
                                    prodPrice: widget.prodPrice,
                                    numStars: widget.numStars,
                                    quantity: widget.quantity,
                                    description: widget.description,
                                    prodImage: widget.prodImage,
                                  );
                                },
                              ));
                            },
                            style: ElevatedButton.styleFrom(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(5),
                              ),
                              backgroundColor: BLACK_COLOR,
                            ),
                            child: CustomText(
                              text: widget.btnName,
                              fontSize: ScreenUtil().setSp(12),
                              color: WHITE_COLOR,
                              fontWeight: FontWeight.w700,
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
}
