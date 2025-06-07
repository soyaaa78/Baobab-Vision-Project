import '/screens/cart_screen.dart';
import '/screens/vto_screen.dart';
import '/widgets/custom_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:baobab_vision_project/constants.dart';

class SuggestionScreen extends StatefulWidget {
  final List<dynamic>? recommendedProducts;
  const SuggestionScreen({super.key, this.recommendedProducts});

  @override
  State<SuggestionScreen> createState() => _SuggestionScreenState();
}

class _SuggestionScreenState extends State<SuggestionScreen> {
  @override
  Widget build(BuildContext context) {
    List<dynamic> products = [];
    final rec = widget.recommendedProducts;
    if (rec != null) {
      if (rec is List) {
        products = rec.take(5).toList();
      } else if (rec is Map) {
        final recMap = rec as Map;
        if (recMap.containsKey('recommended') &&
            recMap['recommended'] is List) {
          products = (recMap['recommended'] as List).take(5).toList();
        }
      }
    }

    return Scaffold(
        backgroundColor: WHITE_COLOR,
        appBar: AppBar(
          title: const Text('Eyewear Recommender'),
          backgroundColor: WHITE_COLOR,
        ),
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
                  ...products.map((product) => Padding(
                        padding: const EdgeInsets.only(bottom: 32.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Center(
                              child: Container(
                                height: 250,
                                width: 250,
                                decoration: BoxDecoration(
                                  color: Colors.grey[300],
                                  borderRadius: BorderRadius.circular(16),
                                  image: product['imageUrls'] != null &&
                                          product['imageUrls'].isNotEmpty
                                      ? DecorationImage(
                                          image: NetworkImage(
                                              product['imageUrls'][0]),
                                          fit: BoxFit.cover,
                                        )
                                      : const DecorationImage(
                                          image: NetworkImage(
                                              "https://baobabeyewear.com/cdn/shop/files/WES-6.2FemaleModel.jpg?v=1739968211&width=1946"),
                                          fit: BoxFit.cover,
                                        ),
                                ),
                                alignment: Alignment.center,
                              ),
                            ),
                            SizedBox(height: ScreenUtil().setHeight(15)),
                            CustomText(
                              text: product['name'] ?? 'Eyewear',
                              fontSize: ScreenUtil().setSp(24),
                              color: const Color(0xFF252525),
                              fontWeight: FontWeight.bold,
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    CustomText(
                                      text: product['name'] ?? '',
                                      fontSize: ScreenUtil().setSp(12),
                                      color: const Color(0xFF252525),
                                      fontWeight: FontWeight.bold,
                                    ),
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        CustomText(
                                          text: product['price'] != null
                                              ? 'P${product['price']}'
                                              : '',
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
                                          text: product['numStars'] != null
                                              ? '${product['numStars']} Stars'
                                              : '',
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
                                        text: product['description'] ?? '',
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
                                    image: product['imageUrls'] != null &&
                                            product['imageUrls'].isNotEmpty
                                        ? DecorationImage(
                                            image: NetworkImage(
                                                product['imageUrls'][0]),
                                            fit: BoxFit.cover,
                                          )
                                        : const DecorationImage(
                                            image: AssetImage(
                                                "assets/images/wes.gif"),
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
                                  if (product['lensOptions'] != null &&
                                      product['lensOptions'].isNotEmpty) ...[
                                    ...product['lensOptions']
                                        .take(2)
                                        .map<Widget>((opt) => CustomText(
                                              text:
                                                  '- ${opt['label']} (${opt['type']}${opt['price'] != null && opt['price'] > 0 ? ' (+${opt['price']} PHP)' : ''})',
                                              fontSize: ScreenUtil().setSp(16),
                                              color: Colors.grey,
                                            ))
                                        .toList(),
                                    if (product['lensOptions'].length > 2)
                                      CustomText(
                                        text:
                                            '+${product['lensOptions'].length - 2} more',
                                        fontSize: ScreenUtil().setSp(14),
                                        color: Colors.grey,
                                        fontWeight: FontWeight.w500,
                                      ),
                                  ] else ...[
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
                                      text: 'Boosting Black (+2,400 PHP)',
                                      fontSize: ScreenUtil().setSp(16),
                                      color: Colors.grey,
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            SizedBox(height: ScreenUtil().setHeight(10)),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                ElevatedButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            const VirtualTryOnScreen(),
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF252525),
                                    foregroundColor: const Color(0xFFFCF7F2),
                                  ),
                                  child: const Text("Virtual Try-On"),
                                ),
                                ElevatedButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            const CartScreen(),
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF252525),
                                    foregroundColor: const Color(0xFFFCF7F2),
                                  ),
                                  child: const Text("Add to Cart"),
                                ),
                              ],
                            ),
                          ],
                        ),
                      )),
                ]))));
  }
}