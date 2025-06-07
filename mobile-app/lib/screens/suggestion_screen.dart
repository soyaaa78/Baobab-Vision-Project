import '/screens/detail_screen.dart';
import '/widgets/custom_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:baobab_vision_project/constants.dart';
import 'package:baobab_vision_project/models/productModel.dart';

class SuggestionScreen extends StatefulWidget {
  final List<dynamic>? recommendedProducts;
  const SuggestionScreen({super.key, this.recommendedProducts});

  @override
  State<SuggestionScreen> createState() => _SuggestionScreenState();
}

class _SuggestionScreenState extends State<SuggestionScreen> {
  @override
  Widget build(BuildContext context) {
    final List<dynamic> items = widget.recommendedProducts ?? [];
    final List<dynamic> products = items
        .where((item) => item != null && item['product'] != null)
        .map((item) => item['product'])
        .toList();

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
                  ),                  SizedBox(height: ScreenUtil().setHeight(25)),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: products.length,
                    itemBuilder: (context, index) {
                      final product = products[index];
                      final rank = index + 1;
                      
                      // Different colors for ranking badges
                      Color getRankingColor(int rank) {
                        switch (rank) {
                          case 1:
                            return const Color(0xFFFFD700); // Gold
                          case 2:
                            return const Color(0xFFC0C0C0); // Silver
                          case 3:
                            return const Color(0xFFCD7F32); // Bronze
                          default:
                            return const Color(0xFF6B7280); // Gray
                        }
                      }

                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        child: GestureDetector(
                          onTap: () {
                            // Navigate to detail screen when card is tapped
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => DetailScreen(
                                  productId: product['_id'] ?? '',
                                  prodName: product['name'] ?? 'Eyewear',
                                  prodSize:
                                      '${product['stock'] ?? 0} pcs Available',
                                  prodPrice: '${product['price'] ?? 0} PHP',
                                  numStars: product['numStars'] ?? 5,
                                  quantity: 1,
                                  description: product['description'] ?? '',
                                  prodImages: product['imageUrls'] != null
                                      ? List<String>.from(product['imageUrls'])
                                      : [
                                          "https://baobabeyewear.com/cdn/shop/files/WES-6.2FemaleModel.jpg?v=1739968211&width=1946"
                                        ],
                                  colorOptions: product['colorOptions'] != null
                                      ? (product['colorOptions'] as List<dynamic>)
                                          .map((e) => ColorOption.fromJson(e))
                                          .toList()
                                      : [],
                                  lensOptions: product['lensOptions'] != null
                                      ? (product['lensOptions'] as List<dynamic>)
                                          .map((e) => LensOption.fromJson(e))
                                          .toList()
                                      : [],
                                ),
                              ),
                            );
                          },
                          child: Card(
                            elevation: 6,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),                            child: IntrinsicHeight(
                              child: Row(
                                children: [
                                  // Ranking indicator
                                  Container(
                                    width: 50,
                                    decoration: BoxDecoration(
                                      color: getRankingColor(rank),
                                      borderRadius: const BorderRadius.only(
                                        topLeft: Radius.circular(16),
                                        bottomLeft: Radius.circular(16),
                                      ),
                                    ),
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        if (rank <= 3) 
                                          Icon(
                                            Icons.military_tech,
                                            color: rank == 1 ? Colors.black87 : Colors.white,
                                            size: 20,
                                          )
                                        else
                                          Icon(
                                            Icons.star,
                                            color: Colors.white,
                                            size: 16,
                                          ),
                                        SizedBox(height: 2),
                                        CustomText(
                                          text: '#$rank',
                                          fontSize: ScreenUtil().setSp(14),
                                          color: rank == 1 ? Colors.black87 : Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ],
                                    ),
                                  ),
                                  // Product Image
                                  Container(
                                    width: 100,
                                    height: 120,
                                    decoration: BoxDecoration(
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
                                  ),
                                  // Product Details
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.all(12.0),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisAlignment: MainAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Expanded(
                                                child: CustomText(
                                                  text: product['name'] ?? 'Eyewear',
                                                  fontSize: ScreenUtil().setSp(16),
                                                  color: const Color(0xFF252525),
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                              if (rank == 1)
                                                Container(
                                                  padding: const EdgeInsets.symmetric(
                                                    horizontal: 6,
                                                    vertical: 2,
                                                  ),
                                                  decoration: BoxDecoration(
                                                    color: const Color(0xFFFFD700),
                                                    borderRadius: BorderRadius.circular(8),
                                                  ),
                                                  child: CustomText(
                                                    text: 'BEST',
                                                    fontSize: ScreenUtil().setSp(8),
                                                    color: Colors.black87,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                            ],
                                          ),
                                          SizedBox(height: ScreenUtil().setHeight(4)),
                                          CustomText(
                                            text: (product['description'] ?? '').length > 50 
                                                ? '${(product['description'] ?? '').substring(0, 50)}...'
                                                : product['description'] ?? '',
                                            fontSize: ScreenUtil().setSp(11),
                                            color: Colors.grey.shade600,
                                          ),
                                          SizedBox(height: ScreenUtil().setHeight(6)),
                                          Row(
                                            children: [
                                              CustomText(
                                                text: product['price'] != null
                                                    ? 'P${product['price']}'
                                                    : 'P0',
                                                fontSize: ScreenUtil().setSp(15),
                                                color: const Color(0xFF252525),
                                                fontWeight: FontWeight.bold,
                                              ),
                                              const Spacer(),
                                              Row(
                                                children: [
                                                  Icon(
                                                    Icons.star,
                                                    size: ScreenUtil().setSp(14),
                                                    color: Colors.amber,
                                                  ),
                                                  SizedBox(width: 2),
                                                  CustomText(
                                                    text: '${product['numStars'] ?? 5}',
                                                    fontSize: ScreenUtil().setSp(12),
                                                    color: Colors.grey,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                          SizedBox(height: ScreenUtil().setHeight(6)),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 8,
                                              vertical: 4,
                                            ),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF252525),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: CustomText(
                                              text: 'RECOMMENDED',
                                              fontSize: ScreenUtil().setSp(9),
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ]))));
  }
}
