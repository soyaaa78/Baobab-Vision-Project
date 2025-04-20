import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';
import 'package:baobab_vision_project/widgets/custom_horizontal_product_card.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<Map<String, dynamic>> cartItems = [
    {
      'prodName': 'WEBB',
      'prodSize': '3pcs Available',
      'prodPrice': 500.00,
      'numStars': 5,
      'prodImage': 'assets/images/eyewear_1.png',
    },
    {
      'prodName': 'GILMORE',
      'prodSize': '5pcs Available',
      'prodPrice': 500.00,
      'numStars': 4,
      'prodImage': 'assets/images/eyewear_2.png',
    },
    {
      'prodName': 'CAINE',
      'prodSize': '5pcs Available',
      'prodPrice': 500.00,
      'numStars': 5,
      'prodImage': 'assets/images/eyewear_3.png',
    },
   
  ];

  double getTotalPrice() {
    return cartItems.fold(0, (sum, item) => sum + item['prodPrice']);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        title: CustomText(
          text: 'Shopping Cart',
          fontSize: ScreenUtil().setSp(25),
          color: BLACK_COLOR,
          fontWeight: FontWeight.bold,
        ),
        backgroundColor: WHITE_COLOR,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: cartItems.isEmpty
                ? Center(
                    child: CustomText(
                      text: 'Your cart is empty',
                      fontSize: ScreenUtil().setSp(20),
                      color: BLACK_COLOR,
                    ),
                  )
                : ListView.builder(
                    itemCount: cartItems.length,
                    itemBuilder: (context, index) {
                      return CustomHorizontalProductCard(
                        prodName: cartItems[index]['prodName'],
                        prodSize: cartItems[index]['prodSize'],
                        prodPrice: '${cartItems[index]['prodPrice']} PHP',
                        numStars: cartItems[index]['numStars'],
                        prodImage: cartItems[index]['prodImage'],
                        isCart: true,
                      );
                    },
                  ),
          ),
          if (cartItems.isNotEmpty)
            Padding(
              padding: EdgeInsets.all(ScreenUtil().setSp(20)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  CustomText(
                    text: 'Total: ${getTotalPrice()} PHP',
                    fontSize: ScreenUtil().setSp(20),
                    color: BLACK_COLOR,
                    fontWeight: FontWeight.bold,
                  ),
                  ElevatedButton(
                    onPressed: () {
                      // Add checkout logic here
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: BLACK_COLOR,
                      padding: EdgeInsets.symmetric(vertical: 12.h, horizontal: 43.w),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: CustomText(
                      text: 'Check Out',
                      fontSize: ScreenUtil().setSp(15),
                      color: WHITE_COLOR,
                      //fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
