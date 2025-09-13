import 'package:baobab_vision_project/constants.dart';
import 'package:baobab_vision_project/models/productModel.dart';
import 'package:baobab_vision_project/screens/detail_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:baobab_vision_project/services/api_client.dart';

class CatalogueScreen extends StatefulWidget {
  const CatalogueScreen({super.key});

  @override
  State<CatalogueScreen> createState() => _CatalogueScreenState();
}

class _CatalogueScreenState extends State<CatalogueScreen>
    with AutomaticKeepAliveClientMixin {
  List<dynamic> products = [];
  Map<String, double> productRatings = {}; // store average ratings
  Map<String, int> productTotalReviews = {}; // store total reviews
  List<dynamic> _originalProducts = []; // preserve original fetched list

  @override
  bool get wantKeepAlive => true; // keeps the widget alive in PageView

  Future<void> fetchProducts() async {
    try {
      final response = await http.get(
        Uri.parse(
            'https://baobab-vision-project-peox.onrender.com/api/products'),
      );
      if (response.statusCode == 200) {
        final decodedProducts = jsonDecode(response.body);
        setState(() {
          products = decodedProducts;
          _originalProducts = List<dynamic>.from(decodedProducts);
        });
        // fetch rating for each product
        for (var product in decodedProducts) {
          _fetchRatingStats(product['_id']);
        }
        print("Fetched all products: $products");
      } else {
        print('Failed to load products: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching products: $e');
    }
  }

  Future<void> fetchFilteredProducts(String sortBy, String order) async {
    // Deprecated: Server-side sorting replaced by client-side sorting for responsiveness.
    _sortProducts(sortBy, order);
  }

  void _sortProducts(String sortBy, String order) {
    setState(() {
      List<dynamic> list = List<dynamic>.from(_originalProducts);

      int direction(String ord) => ord == 'asc' ? 1 : -1;
      final dir = direction(order);

      int safeCompare(num a, num b) => a == b ? 0 : (a < b ? -1 : 1);

      switch (sortBy) {
        case 'price':
          list.sort((a, b) =>
              dir *
              safeCompare((a['price'] ?? 0) as num, (b['price'] ?? 0) as num));
          break;
        case 'top-sales':
          list.sort((a, b) =>
              dir *
              safeCompare((a['sales'] ?? 0) as num, (b['sales'] ?? 0) as num));
          break;
        case 'latest':
          list.sort((a, b) {
            DateTime pa = DateTime.tryParse(a['createdAt'] ?? '') ??
                DateTime.fromMillisecondsSinceEpoch(0);
            DateTime pb = DateTime.tryParse(b['createdAt'] ?? '') ??
                DateTime.fromMillisecondsSinceEpoch(0);
            return dir * pa.compareTo(pb);
          });
          break;
        case 'popular':
          // Composite score: sales weight + average rating weight
          list.sort((a, b) {
            final aid = a['_id'];
            final bid = b['_id'];
            final ar = productRatings[aid]?.toDouble() ??
                (a['numStars'] ?? 0).toDouble();
            final br = productRatings[bid]?.toDouble() ??
                (b['numStars'] ?? 0).toDouble();
            final asales = (a['sales'] ?? 0) as num;
            final bsales = (b['sales'] ?? 0) as num;
            // scoring: rating *10 + sales
            final ascore = ar * 10 + asales;
            final bscore = br * 10 + bsales;
            return dir * safeCompare(ascore, bscore);
          });
          break;
        default:
          // Unknown -> leave order as original
          break;
      }

      products = list;
    });
  }

  Future<void> _fetchRatingStats(String productId) async {
    try {
      final resp = await ApiClient.get('/api/products/$productId/reviews');
      if (resp.statusCode == 200) {
        final data = json.decode(resp.body) as Map<String, dynamic>;
        final stats = (data['stats'] as Map<String, dynamic>?);
        final avg = (stats?['averageRoundedUp1dp'] ?? 0).toDouble();
        final total = (stats?['total'] ?? 0) as int;
        setState(() {
          productRatings[productId] = avg;
          productTotalReviews[productId] = total;
        });
      }
    } catch (_) {
      // ignore network errors for badge
    }
  }

  Future<String?> getUsername() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('username');
  }

  @override
  void initState() {
    super.initState();
    fetchProducts();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        title: Text(
          'Catalogue',
          style: TextStyle(
            fontSize: 24.sp, // slightly larger for prominence
            fontWeight: FontWeight.w800,
            color: BLACK_COLOR,
            letterSpacing: 0.5, // subtle spacing for elegance
          ),
        ),
        backgroundColor: WHITE_COLOR,
        elevation: 0.5,
        shadowColor: Colors.grey.shade300,
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list_alt, color: Colors.black87),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                shape: RoundedRectangleBorder(
                  borderRadius:
                      BorderRadius.vertical(top: Radius.circular(20.0)),
                ),
                builder: (BuildContext context) {
                  return Container(
                    padding:
                        EdgeInsets.symmetric(vertical: 16.h, horizontal: 20.w),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: Container(
                            height: 5.h,
                            width: 50.w,
                            margin: EdgeInsets.only(bottom: 20.h),
                            decoration: BoxDecoration(
                              color: Colors.grey[400],
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                        Text(
                          'Sort Products',
                          style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w700,
                              color: Colors.black87),
                        ),
                        SizedBox(height: 12.h),
                        ...[
                          {
                            'icon': Icons.star,
                            'text': 'Popular',
                            'sortBy': 'popular',
                            'order': 'desc'
                          },
                          {
                            'icon': Icons.access_time,
                            'text': 'Latest',
                            'sortBy': 'latest',
                            'order': 'desc'
                          },
                          {
                            'icon': Icons.trending_up,
                            'text': 'Top Sales',
                            'sortBy': 'top-sales',
                            'order': 'desc'
                          },
                          {
                            'icon': Icons.price_change,
                            'text': 'Price: Low to High',
                            'sortBy': 'price',
                            'order': 'asc'
                          },
                          {
                            'icon': Icons.price_change_outlined,
                            'text': 'Price: High to Low',
                            'sortBy': 'price',
                            'order': 'desc'
                          },
                        ]
                            .map((filter) => ListTile(
                                  leading: Icon(filter['icon'] as IconData,
                                      color: BLACK_COLOR),
                                  title: Text(filter['text'] as String,
                                      style: TextStyle(
                                          fontWeight: FontWeight.w600,
                                          fontSize: 14.sp)),
                                  onTap: () {
                                    Navigator.pop(context);
                                    _sortProducts(
                                      filter['sortBy'] as String,
                                      filter['order'] as String,
                                    );
                                  },
                                ))
                            .toList(),
                      ],
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'All Items',
              style: TextStyle(
                fontSize: 18.sp, // slightly larger
                fontWeight: FontWeight.w700,
                color: Colors.black87.withOpacity(0.85), // softer black
                letterSpacing: 0.3, // subtle spacing
              ),
            ),
            SizedBox(height: 14.h),
            Expanded(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  if (products.isEmpty) {
                    return Center(child: CircularProgressIndicator());
                  }

                  final double cardWidth = (constraints.maxWidth - 16.w) / 2;
                  final double cardHeight = 260.h;
                  final double childAspectRatio = cardWidth / cardHeight;

                  return GridView.builder(
                    itemCount: products.length,
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16.w,
                      mainAxisSpacing: 16.h,
                      childAspectRatio: childAspectRatio,
                    ),
                    itemBuilder: (context, index) {
                      final product = products[index];
                      String imageUrl = product['imageUrls'] != null &&
                              product['imageUrls'] is List
                          ? product['imageUrls'].isNotEmpty
                              ? product['imageUrls'][0]
                              : 'assets/images/default.png'
                          : 'assets/images/default.png';

                      final avgRating = productRatings[product['_id']] ?? 0.0;
                      final totalReviews =
                          productTotalReviews[product['_id']] ?? 0;

                      return GestureDetector(
                        onTap: () async {
                          String productId = product['_id'];
                          String? username = await getUsername();
                          if (username == null) return;

                          try {
                            await http.post(
                              Uri.parse(
                                  'https://baobab-vision-project-peox.onrender.com/api/user/update-preferences/$username'),
                              headers: {'Content-Type': 'application/json'},
                              body: jsonEncode({'productId': productId}),
                            );
                          } catch (e) {
                            print('Error updating preferences: $e');
                          }

                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => DetailScreen(
                                productId: product['_id'],
                                prodName: product['name'] ?? 'Unknown',
                                prodSize: '${product['stock']} pcs Available',
                                prodPrice: '${product['price']} PHP',
                                numStars: product['numStars'] ?? 0,
                                quantity: product['stock'] ?? 0,
                                description: product['description'] ??
                                    'No description available',
                                prodImages: (product['imageUrls'] != null &&
                                        product['imageUrls'] is List)
                                    ? List<String>.from(product['imageUrls'])
                                    : [imageUrl],
                                colorOptions: (product['colorOptions']
                                            as List<dynamic>? ??
                                        [])
                                    .map((e) => ColorOption.fromJson(e))
                                    .toList(),
                                lensOptions:
                                    (product['lensOptions'] as List<dynamic>)
                                        .map((e) => LensOption.fromJson(e))
                                        .toList(),
                              ),
                            ),
                          );
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: WHITE_COLOR,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Colors.grey.shade300,
                              width: 1.0,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.15),
                                spreadRadius: 1,
                                blurRadius: 10,
                                offset: Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.vertical(
                                    top: Radius.circular(16)),
                                child: Image.network(
                                  imageUrl,
                                  height: 150.h,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) =>
                                      Container(
                                    height: 150.h,
                                    color: Colors.grey.shade200,
                                    child: Icon(Icons.broken_image, size: 48),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: EdgeInsets.all(10.w),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Text(
                                      product['name'],
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14.sp,
                                        fontFamily: 'Montserrat',
                                        color: Colors.black87,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      textAlign: TextAlign.center,
                                    ),
                                    SizedBox(height: 8.h),
                                    Text(
                                      '${product['price']} PHP',
                                      style: TextStyle(
                                        fontSize: 13.sp,
                                        fontWeight: FontWeight.w500,
                                        color: BLACK_COLOR,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                    SizedBox(height: 8.h),
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: List.generate(5, (starIndex) {
                                        final raw = avgRating.clamp(0, 5);
                                        final remaining = raw - starIndex;
                                        IconData icon;
                                        Color color;
                                        if (remaining >= 1) {
                                          icon = Icons.star;
                                          color = Colors.amber;
                                        } else if (remaining >= 0.5) {
                                          icon = Icons.star_half;
                                          color = Colors.amber;
                                        } else {
                                          icon = Icons.star_border;
                                          color = Colors.grey.shade300;
                                        }
                                        return Icon(icon,
                                            size: 14.sp, color: color);
                                      }),
                                    ),
                                    SizedBox(height: 4.h),
                                    Text(
                                      '(${totalReviews.toString()})',
                                      style: TextStyle(
                                        fontSize: 11.sp,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
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
