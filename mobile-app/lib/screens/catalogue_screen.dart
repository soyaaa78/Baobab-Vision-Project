import 'package:baobab_vision_project/constants.dart';
import 'package:baobab_vision_project/models/productModel.dart';
import 'package:baobab_vision_project/screens/detail_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class CatalogueScreen extends StatefulWidget {
  const CatalogueScreen({super.key});

  @override
  State<CatalogueScreen> createState() => _CatalogueScreenState();
}

class _CatalogueScreenState extends State<CatalogueScreen> with AutomaticKeepAliveClientMixin {
  List<dynamic> products = [];

  @override
  bool get wantKeepAlive => true; // <-- Keeps the widget alive in PageView

  Future<void> fetchProducts() async {
    try {
      final response = await http.get(Uri.parse('http://10.0.2.2:3001/api/productRoutes'));
      if (response.statusCode == 200) {
        setState(() {
          products = jsonDecode(response.body);
        });
        print("Fetched all products: $products");
      } else {
        print('Failed to load products: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching products: $e');
    }
  }

  Future<void> fetchFilteredProducts(String sortBy, String order) async {
    final uri = Uri.parse('http://10.0.2.2:3001/api/productRoutes?sortBy=$sortBy&order=$order');
    try {
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        setState(() {
          products = jsonDecode(response.body);
        });
        print("Fetched filtered products sorted by $sortBy ($order)");
      } else {
        print('Failed to fetch filtered products');
      }
    } catch (e) {
      print('Error: $e');
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
    super.build(context); // <-- Needed for AutomaticKeepAliveClientMixin
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        title: Text(
          'Catalogue',
          style: TextStyle(
            fontSize: 20.sp,
            fontWeight: FontWeight.w700,
            color: Colors.black,
          ),
        ),
        backgroundColor: WHITE_COLOR,
        elevation: 1,
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list_alt, color: Colors.black),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(16.0)),
                ),
                builder: (BuildContext context) {
                  return Container(
                    padding: EdgeInsets.symmetric(vertical: 12.h),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          height: 5.h,
                          width: 40.w,
                          margin: EdgeInsets.only(bottom: 10.h),
                          decoration: BoxDecoration(
                            color: Colors.grey[400],
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        ...[
                          {'icon': Icons.star, 'text': 'Popular', 'sortBy': 'popular', 'order': 'desc'},
                          {'icon': Icons.access_time, 'text': 'Latest', 'sortBy': 'latest', 'order': 'desc'},
                          {'icon': Icons.trending_up, 'text': 'Top Sales', 'sortBy': 'top-sales', 'order': 'desc'},
                          {'icon': Icons.price_change, 'text': 'Price: Low to High', 'sortBy': 'price', 'order': 'asc'},
                          {'icon': Icons.price_change_outlined, 'text': 'Price: High to Low', 'sortBy': 'price', 'order': 'desc'},
                        ].map((filter) => ListTile(
                          leading: Icon(filter['icon'] as IconData),
                          title: Text(filter['text'] as String, style: TextStyle(fontWeight: FontWeight.w600)),
                          onTap: () {
                            Navigator.pop(context);
                            fetchFilteredProducts(filter['sortBy'] as String, filter['order'] as String);
                          },
                        )).toList(),
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
        padding: EdgeInsets.all(ScreenUtil().setWidth(15)),
        child: Column(
          children: [
            Row(
              children: [
                Text(
                  'All items',
                  style: TextStyle(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                ),
                Spacer(),
              ],
            ),
            SizedBox(height: 10.h),
            Expanded(
              child: GridView.builder(
                itemCount: products.length,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12.w,
                  mainAxisSpacing: 12.h,
                  childAspectRatio: 0.78,
                ),
                itemBuilder: (context, index) {
                  final product = products[index];
                  String imageUrl = product['imageUrls'] != null && product['imageUrls'] is List
                      ? product['imageUrls'].isNotEmpty
                          ? product['imageUrls'][0]
                          : 'assets/images/default.png'
                      : 'assets/images/default.png';

                  return GestureDetector(
                    onTap: () async {
                      String productId = product['_id'];
                      String? username = await getUsername();
                      print("Username fetched: $username");

                      if (username == null) {
                        print('Error: No username found.');
                        return;
                      }

                      try {
                        final response = await http.post(
                          Uri.parse('http://10.0.2.2:3001/api/userPreferences/update-preferences/$username'),
                          headers: {'Content-Type': 'application/json'},
                          body: jsonEncode({'productId': productId}),
                        );
                        if (response.statusCode == 200) {
                          print('Successfully updated preferences for productId: $productId');
                        } else {
                          print('Failed to update preferences: ${response.statusCode}');
                          print(response.body);
                        }
                      } catch (e) {
                        print('Error updating preferences: $e');
                      }

                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => DetailScreen(
                            productId: product['_id'], // <-- add this line
                            prodName: product['name'] ?? 'Unknown',
                            prodSize: '${product['stock']} pcs Available',
                            prodPrice: '${product['price']} PHP',
                            numStars: product['numStars'] ?? 0,
                            quantity: product['stock'] ?? 0,
                            description: product['description'] ?? 'No description available',
                            prodImages: (product['imageUrls'] != null && product['imageUrls'] is List)
                                ? List<String>.from(product['imageUrls'])
                                : [imageUrl],
                            colorOptions: (product['colorOptions'] as List<dynamic>? ?? [])
                                .map((e) => ColorOption.fromJson(e))
                                .toList(),
                            lensOptions: (product['lensOptions'] as List<dynamic>)
                                .map((e) => LensOption.fromJson(e))
                                .toList(),
                          ),
                        ),
                      );
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: WHITE_COLOR,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            spreadRadius: 2,
                            blurRadius: 8,
                            offset: Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                            child: Image.network(
                              imageUrl,
                              height: 130.h,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  Container(
                                    height: 130.h,
                                    color: Colors.grey.shade200,
                                    child: Icon(Icons.broken_image, size: 48),
                                  ),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsets.all(8.w),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Center(
                                  child: Text(
                                    product['name'],
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14.sp,
                                      color: Colors.black87,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                SizedBox(height: 4.h),
                                Center(
                                  child: Text(
                                    '${product['price']} PHP',
                                    style: TextStyle(
                                      fontSize: 13.sp,
                                      fontWeight: FontWeight.w900,
                                      color: BLACK_COLOR,
                                    ),
                                  ),
                                ),
                                SizedBox(height: 4.h),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: List.generate(5, (index) {
                                    return Icon(
                                      Icons.star,
                                      size: 14.sp,
                                      color: index < (product['numStars'] ?? 0)
                                          ? Colors.amber
                                          : Colors.grey.shade300,
                                    );
                                  }),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
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
