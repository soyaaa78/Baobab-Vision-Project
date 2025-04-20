import 'package:aniasco_long_exam1/screens/recommender_screen.dart';
import 'package:aniasco_long_exam1/screens/vto_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';
import 'package:aniasco_long_exam1/widgets/custom_vertical_product_card.dart';
import 'package:aniasco_long_exam1/widgets/custom_horizontal_product_card.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
  
}

class _ShopScreenState extends State<ShopScreen> {
  String username = '';

  @override
  void initState() {
    super.initState();
    _loadUsername();
  }

  Future<void> _loadUsername() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      username = prefs.getString('username') ?? 'Guest';
    });
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Container(
        margin: EdgeInsets.fromLTRB(
          ScreenUtil().setSp(20),
          ScreenUtil().setSp(60),
          ScreenUtil().setSp(20),
          0,
        ),
        color: WHITE_COLOR,
        width: ScreenUtil().screenWidth,
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: Image.asset(
                'assets/images/baobab_logo.png',
                width: ScreenUtil().setSp(130),
                height: ScreenUtil().setSp(60),
              ),
            ),
            SizedBox(height: ScreenUtil().setHeight(5)),
            Align(
              alignment: Alignment.centerLeft,
              child: CustomText(
                text: 'Good day, $username',
                fontSize: ScreenUtil().setSp(20),
                color: BLACK_COLOR,
                fontWeight: FontWeight.w900,
              ),
            ),
            SizedBox(height: ScreenUtil().setHeight(3)),
            Align(
              alignment: Alignment.centerLeft,
              child: CustomText(
                text: 'Ready to see the Future?',
                fontSize: ScreenUtil().setSp(12),
                color: Colors.grey,
              ),
            ),
            SizedBox(height: ScreenUtil().setHeight(10)),
            
            // Virtual Try-On & Profiling Buttons
            Row(
  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
  children: [
    ElevatedButton(
      onPressed: () {
  Navigator.push(
    context,
    MaterialPageRoute(builder: (context) => VirtualTryOnScreen()), // Navigate to ProfileScreen
  );
},
      style: ElevatedButton.styleFrom(
        backgroundColor: BLACK_COLOR,
        minimumSize: Size(160, 120), // Square shape
        padding: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8), // Slightly rounded corners
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.add_a_photo, size: 30, color:WHITE_COLOR,),
          SizedBox(height: 5),
          Text('Virtual Try-On',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: WHITE_COLOR,
                fontWeight: FontWeight.bold,
              )
          ),
          SizedBox(height: 2), // Add space between texts
        Text(
        'Want to Try a Frame on?',
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: 10,
          color: WHITE_COLOR, // You can customize the color
        )),
        ],
      ),
    ),
    ElevatedButton(
      onPressed: () {
  Navigator.push(
    context,
    MaterialPageRoute(builder: (context) => RecommenderScreen()), // Navigate to ProfileScreen
  );
},
      style: ElevatedButton.styleFrom(
        backgroundColor: BLACK_COLOR,
        minimumSize: Size(160, 120), // Square shape
        padding: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8), // Slightly rounded corners
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.person, size: 30, color: WHITE_COLOR,),
          SizedBox(height: 5),
          Text('Recommender',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: WHITE_COLOR,
                fontWeight: FontWeight.bold,
              )),
              SizedBox(height: 2), // Add space between texts
        Text(
        'Best Eyewear for You?',
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: 10,
          color: WHITE_COLOR, // You can customize the color
        )),
        ],
      ),
    ),
  ],
),

            SizedBox(height: ScreenUtil().setHeight(10)),
            
            Align(
              alignment: Alignment.centerLeft,
              child: CustomText(
                text: 'FOR YOU',
                fontSize: ScreenUtil().setSp(15),
                color: BLACK_COLOR,
                fontWeight: FontWeight.w900,
              ),
            ),
            SizedBox(height: ScreenUtil().setHeight(10)),
            
            SizedBox(
              width: ScreenUtil().setWidth(1000),
              child: const SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    CustomVerticalProductCard(
                      prodName: 'WEBB',
                      prodSize: '10pcs Available',
                      prodPrice: '500.00 PHP',
                      numStars: 5,
                      quantity: 10,
                      description: 'WEBB is best worn on your way to grab your second coffee on a Monday. Pair it with sweatpants, sneakers, and a cropped tank to look put-together',
                      prodImage: 'assets/images/eyewear_1.png',
                    ),
                    CustomVerticalProductCard(
                      prodName: 'GILMORE',
                      prodSize: '3pcs Available',
                      prodPrice: '500.00 PHP',
                      numStars: 5,
                      quantity: 34,
                      description: 'GILMORE is the best worn with your friends on the way to the outing. It says, yes-Im-present-and-enjoying-life-and-I-know-I-look-good. Plus, it has a top bar nose bridge which makes it universally flattering across all genders and face shapes.',
                      prodImage: 'assets/images/eyewear_2.png',
                    ),
                    CustomVerticalProductCard(
                      prodName: 'CAINE',
                      prodSize: '3pcs Available',
                      prodPrice: '500.00 PHP',
                      numStars: 5,
                      quantity: 34,
                      description: 'Make a lasting impression with CAINE - a rectangular frame that has slightly swept up corners.',
                      prodImage: 'assets/images/eyewear_3.png',
                    ),
                    CustomVerticalProductCard(
                      prodName: 'JOLIE',
                      prodSize: '3pcs Available',
                      prodPrice: '500.00 PHP',
                      numStars: 5,
                      quantity: 34,
                      description: 'Style JOLIE in something 90s. We suggest flared plants, a fitted top, and chunky platform shoes.',
                      prodImage: 'assets/images/eyewear_5.png',
                    ),
                    CustomVerticalProductCard(
                      prodName: 'MACK',
                      prodSize: '3pcs Available',
                      prodPrice: '500.00 PHP',
                      numStars: 5,
                      quantity: 34,
                      description: 'A bold frame with gentle curves. MACK is a chunky rounded square frame thats a bit daring and up to no good.',
                      prodImage: 'assets/images/eyewear_6.png',
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: ScreenUtil().setHeight(10)),
            
            Align(
              alignment: Alignment.centerLeft,
              child: CustomText(
                text: 'BEST SELLERS',
                fontSize: ScreenUtil().setSp(15),
                color: BLACK_COLOR,
                fontWeight: FontWeight.w900,
              ),
            ),
            SizedBox(height: ScreenUtil().setHeight(10)),
            
            Column(
              children: [
                CustomHorizontalProductCard(
                  prodName: 'MIRANDA',
                  prodSize: '3pcs Available',
                  prodPrice: '360.00 PHP',
                  numStars: 5,
                  prodImage: 'assets/images/eyewear_4.png',
                ),
                CustomHorizontalProductCard(
                  prodName: 'JACQ',
                  prodSize: '3pcs Available',
                  prodPrice: '500.00 PHP',
                  numStars: 5,
                  prodImage: 'assets/images/eyewear_7.png',
                ),
                CustomHorizontalProductCard(
                  prodName: 'JEAN',
                  prodSize: '3pcs Available',
                  prodPrice: '500.00 PHP',
                  numStars: 5,
                  prodImage: 'assets/images/eyewear_8.png',
                ),
                CustomHorizontalProductCard(
                  prodName: 'ASTRA',
                  prodSize: '3pcs Available',
                  prodPrice: '500.00 PHP',
                  numStars: 5,
                  prodImage: 'assets/images/eyewear_9.png',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}