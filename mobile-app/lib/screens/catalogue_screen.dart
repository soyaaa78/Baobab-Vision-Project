import 'package:baobab_vision_project/constants.dart';
import 'package:baobab_vision_project/screens/detail_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:http/http.dart' as http;
import 'dart:convert'; // For JSON decoding
import 'package:shared_preferences/shared_preferences.dart';

class CatalogueScreen extends StatefulWidget {
  const CatalogueScreen({super.key});

  @override
  State<CatalogueScreen> createState() => _CatalogueScreenState();
}

class _CatalogueScreenState extends State<CatalogueScreen> {
  // List to hold fetched products
  List<dynamic> products = [];

  // Fetch products from the backend
  Future<void> fetchProducts() async {
    try {
      final response = await http.get(Uri.parse('http://10.0.2.2:3001/api/productRoutes'));  // Fetch all products

      if (response.statusCode == 200) {
        // Decode the JSON response and update state
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

  // Fetch a specific product by ID
  Future<void> fetchProductById(String productId) async {
    try {
      final response = await http.get(Uri.parse('http://10.0.2.2:3001/api/productRoutes/$productId'));  // Fetch the specific product

      if (response.statusCode == 200) {
        final product = jsonDecode(response.body);
        print("Fetched product details: $product");
      } else {
        print('Failed to load product details: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching product: $e');
    }
  }

  Future<String?> getUsername() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('username');
  }

  @override
  void initState() {
    super.initState();
    fetchProducts();  // Fetch all products when the screen loads
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        title: Text(
          'Catalogue',
          style: TextStyle(
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        backgroundColor: WHITE_COLOR,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list_alt, color: Colors.black),
            onPressed: () { 
              print('Filter icon pressed!');
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
                    color: Colors.black,
                  ),
                ),
                Spacer(),
                // Optionally add filter buttons here
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
                  final product = products[index];

                  // Check the image URL and fall back to default if needed
                  String imageUrl = product['imageUrls'] != null && product['imageUrls'] is List
                      ? product['imageUrls'].isNotEmpty
                          ? product['imageUrls'][0]  // Get the first image if available
                          : 'assets/images/default.png'  // Fallback to default image if list is empty
                      : 'assets/images/default.png';  // Fallback if 'imageUrls' is null or not a list

                  return GestureDetector(
                    onTap: () async {
                      String productId = product['_id'];
                      String? username = await getUsername(); // Load saved username

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
                        }
                      } catch (e) {
                        print('Error updating preferences: $e');
                      }

                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => DetailScreen(
                            prodName: product['name'] ?? 'Unknown',
                            prodSize: '${product['stock']} pcs Available',
                            prodPrice: '${product['price']} PHP',
                            numStars: product['numStars'] ?? 0,
                            quantity: product['stock'] ?? 0,
                            description: product['description'] ?? 'No description available',
                            prodImages: (product['imageUrls'] != null && product['imageUrls'] is List)
    ? List<String>.from(product['imageUrls'])  // Handle as list
    : [imageUrl],  // Fallback to default image if no URLs available
 // Pass the correct image URL here
                          ),
                        ),
                      );
                    },
                    child: Card(
                      color: Colors.white,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,  // Center the content inside the card
                        crossAxisAlignment: CrossAxisAlignment.center,  // Center the content inside the card
                        children: [
                          SizedBox(
                            height: 120.h,
                            width: double.infinity,
                            child: Image.network(
                              imageUrl,  // Use the imageUrl variable defined above
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  Icon(Icons.broken_image, size: 48),
                            ),
                          ),
                          SizedBox(height: 8.0),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8.0),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,  // Center text and other elements inside
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Text(
                                  product['name'],
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  textAlign: TextAlign.center,  // Center the text
                                ),
                                Text(
                                  'Stock: ${product['stock']} pcs',
                                  textAlign: TextAlign.center,  // Center the text
                                ),
                                Text(
                                  '${product['price']} PHP',
                                  textAlign: TextAlign.center,  // Center the text
                                ),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,  // Center the stars
                                  children: List.generate(5, (index) {
                                    return Icon(
                                      Icons.star,
                                      color: index < (product['numStars'] ?? 0)
                                          ? Colors.yellow
                                          : Colors.grey,
                                      size: 16,
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
