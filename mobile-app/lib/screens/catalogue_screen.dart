import 'package:baobab_vision_project/widgets/custom_vertical_product_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';

class CatalogueScreen extends StatelessWidget {
  const CatalogueScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Product data
    final List<Map<String, dynamic>> products = [
      {
        'prodName': 'WEBB',
        'prodSize': '5pcs Available',
        'prodPrice': '500.00 PHP',
        'numStars': 4,
        'prodImage': 'assets/images/eyewear_1.png',
        'description': 'WEBB is the best worn on your way to grab second coffee on a Monday. Pair it wil sweatpants, sneakers, and a cropped tank to look put-together.',
      },
      {
        'prodName': 'GILMORE',
        'prodSize': '5pcs Available',
        'prodPrice': '750.00 PHP',
        'numStars': 5,
        'prodImage': 'assets/images/eyewear_2.png',
        'description': 'GILMORE is the best worn with your friends on the way to the outing. It says, yes-Im-present-and-enjoying-life-and-I-know-I-look-good. Plus, it has a top bar nose bridge which makes it universally flattering across all genders and face shapes.',
      },
      {
        'prodName': 'CAINE',
        'prodSize': '5pcs Available',
        'prodPrice': '650.00 PHP',
        'numStars': 4,
        'prodImage': 'assets/images/eyewear_3.png',
        'description': 'Make a lasting impression with CAINE - a rectangular frame that has slightly swept up corneres.',
      },
      {
        'prodName': 'MIRANDA',
        'prodSize': '5pcs Available',
        'prodPrice': '600.00 PHP',
        'numStars': 5,
        'prodImage': 'assets/images/eyewear_4.png',
        'description': 'MIRANDA is best worn while strolling a lavish mansion, wondering how you can contact the real estate agent.',
      },
      {
        'prodName': 'JOLIE',
        'prodSize': '5pcs Available',
        'prodPrice': '600.00 PHP',
        'numStars': 5,
        'prodImage': 'assets/images/eyewear_5.png',
        'description': 'Style JOLIE in something 90s. We suggest flared plants, a fitted top, and chunky platform shoes.',
      },
      {
        'prodName': 'MACK',
        'prodSize': '5pcs Available',
        'prodPrice': '600.00 PHP',
        'numStars': 5,
        'prodImage': 'assets/images/eyewear_6.png',
        'description': 'A bold frame with gentle curves. MACK is a chunky rounded square frame thats a bit daring and up to no good.',
      },
      {
        'prodName': 'JACQ',
        'prodSize': '5pcs Available',
        'prodPrice': '600.00 PHP',
        'numStars': 5,
        'prodImage': 'assets/images/eyewear_7.png',
        'description': 'The JACQ - sophisticated and posh; a cross betweek a cat eye and rectangular frame; its smooth lines and curves always command attention.',
      },
      {
        'prodName': 'JEAN',
        'prodSize': '5pcs Available',
        'prodPrice': '600.00 PHP',
        'numStars': 5,
        'prodImage': 'assets/images/eyewear_8.png',
        'description': 'Channel your inner popstar by adding JEAN to your collection, a stylish rectangle frame, to your look for a little extra pop of color.',
      },{
        'prodName': 'ASTRA',
        'prodSize': '5pcs Available',
        'prodPrice': '600.00 PHP',
        'numStars': 5,
        'prodImage': 'assets/images/eyewear_9.png',
        'description': 'Looking for something out of this world? Meet Astra, an ultra-modern visor frame with a wrap-around design thatll have you feeling like you stepped into another time.',
      },
    ];

    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar( // Removes the default menu button
        title: CustomText(
          text: 'Catalogue',
          fontSize: ScreenUtil().setSp(20),
          fontWeight: FontWeight.bold,
          color: BLACK_COLOR,
        ),
        backgroundColor: WHITE_COLOR,
        elevation: 0, // Removes shadow
      ),
      body: Padding(
        padding: EdgeInsets.all(ScreenUtil().setWidth(15)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CustomText(
                  text: 'All items',
                  fontSize: ScreenUtil().setSp(18),
                  color: BLACK_COLOR,
                ),
                
                Spacer(),
                IconButton(
                  icon: Icon(Icons.menu, color: BLACK_COLOR),
                  onPressed: () {
                    // Add filter functionality here
                  },
                ),
                IconButton(
                  icon: Icon(Icons.filter_alt, color: BLACK_COLOR),
                  onPressed: () {
                    // Add filter functionality here
                  },
                ),
              ],
            ),
            SizedBox(height: 10.h),
            Expanded(
              child: GridView.builder(
                itemCount: products.length,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 10.w,
                  mainAxisSpacing: 10.h,
                  childAspectRatio: 0.7,
                ),
                itemBuilder: (context, index) {
                  return CustomVerticalProductCard(
                    prodName: products[index]['prodName'],
                    prodSize: products[index]['prodSize'],
                    prodPrice: products[index]['prodPrice'],
                    numStars: products[index]['numStars'],
                    prodImage: products[index]['prodImage'],
                    description: products[index]['description'],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
