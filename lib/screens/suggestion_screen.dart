import '/screens/cart_screen.dart';
import '/screens/vto_screen.dart';
import '/widgets/custom_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:aniasco_long_exam1/constants.dart';

class SuggestionScreen extends StatefulWidget {
  const SuggestionScreen({super.key});

  @override
  State<SuggestionScreen> createState() => _SuggestionScreenState();
}

class _SuggestionScreenState extends State<SuggestionScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(title: const Text('Eyewear Recommender'), backgroundColor: WHITE_COLOR,),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: ScreenUtil().setHeight(10)),
              Center(
                child: CustomText(
                  text: 'The perfect fit for you is...',
                  fontSize: ScreenUtil().setSp(24),
                  color: const Color(0xFF252525),
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: ScreenUtil().setHeight(25)),
              Center(
                child: Container(
                  height: 250,
                  width: 250,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(16),
                    image: const DecorationImage(
                      image: NetworkImage("https://baobabeyewear.com/cdn/shop/files/WES-6.2FemaleModel.jpg?v=1739968211&width=1946"),
                      fit: BoxFit.cover,
                    ),
                  ),
                  alignment: Alignment.center,
                ),
              ),
              SizedBox(height: ScreenUtil().setHeight(15)),
              CustomText(
                text: 'WES, in Milk!',
                fontSize: ScreenUtil().setSp(24),
                color: const Color(0xFF252525),
                fontWeight: FontWeight.bold,
              ),
              Row( // for product reco section
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Column( // for whole of product name, price, rating, n desc section
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CustomText(
                            text: 'WES', // product name
                            fontSize: ScreenUtil().setSp(12),
                            color: const Color(0xFF252525),
                            fontWeight: FontWeight.bold,
                          ),
                      Row( // price and rating row
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CustomText(
                            text: 'P500.00',
                            fontSize: ScreenUtil().setSp(12),
                            color: const Color(0xFF252525),
                            fontWeight: FontWeight.bold,
                          ),
                          SizedBox(
                            width: ScreenUtil().setWidth(10),
                            height: ScreenUtil().setHeight(10),
                            child: const VerticalDivider(
                              color: Color(0xFF252525),
                            ),
                          ),
                          CustomText(
                            text: '5.0 Stars',
                            fontSize: ScreenUtil().setSp(12),
                            color: const Color(0xFF252525),
                            fontWeight: FontWeight.bold,
                          ),
                        ],
                      ),
                      SizedBox(height: ScreenUtil().setHeight(8)),
                      SizedBox(
                        width: ScreenUtil().setWidth(180),
                        child: CustomText(
                          text: 'Simple yet striking. WES is a perfect blend between feminine and masculine. Protect your eyes and look great while you\'re at it.',
                          fontSize: ScreenUtil().setSp(10),
                          color: Colors.grey,
                        ),
                      )
                      
                    ],
                  ),
                  
                  Container(
                    height: 140,
                    width: 140,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(16),
                      image: const DecorationImage(
                        image: AssetImage("assets/images/wes.gif"),
                        fit: BoxFit.cover,
                      ),
                    ),
                    alignment: Alignment.center,
                  ),
                ],
              ),
              CustomText(
                    text: 'with...',
                    fontSize: ScreenUtil().setSp(24),
                    color: const Color(0xFF252525),
                    fontWeight: FontWeight.bold,
                  ),

              SizedBox(
                width: ScreenUtil().setWidth(250),
                child: Column(
                  children: [
                    CustomText(
                      text: '- Official Prescription Grade',
                      fontSize: ScreenUtil().setSp(16),
                      color: Colors.grey,
                    ),
                    CustomText(
                      text: '- Sun-Adaptive Lenses in:',
                      fontSize: ScreenUtil().setSp(16),
                      color: Colors.grey,
                    ),
                    CustomText(
                      text: 'Boosting Black (+2,400 PHP)', // change this to textadjust ta [1] in further implementation
                      fontSize: ScreenUtil().setSp(16),
                      color: Colors.grey,
                    ),
                  ],
                ),
              ),
              SizedBox(height: ScreenUtil().setHeight(10)),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const VirtualTryOnScreen()));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF252525),
                      foregroundColor: const Color(0xFFFCF7F2),
                    ),
                    child: const Text("Virtual Try-On"),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const CartScreen()));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF252525),
                      foregroundColor: const Color(0xFFFCF7F2),
                    ),
                    child: const Text("Add to Cart"),
                  ),
                ],
              ),
            ]
          )
        )
      )
    );
  }
}