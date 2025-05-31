import 'package:baobab_vision_project/models/productModel.dart';
import 'package:baobab_vision_project/screens/detail_screen.dart';
import 'package:baobab_vision_project/screens/checkout_screen.dart';  // <-- Added import
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';
import 'package:baobab_vision_project/widgets/custom_horizontal_product_card.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<Map<String, dynamic>> cartItems = [];
  double cartTotal = 0.0;

  @override
  void initState() {
    super.initState();
    _fetchCart();
  }

  // Fetch cart data from the server
  Future<void> _fetchCart() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final userId = prefs.getString('userId');

    if (token == null || userId == null) {
      print('❌ Missing token or userId');
      return;
    }

    final url = Uri.parse('http://10.0.2.2:3001/api/cart/$userId');
    final headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };

    try {
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        print('🛒 CART RESPONSE: $responseData'); // Log the response body

        final cartData = responseData['cart']['items'] as List;

        setState(() {
          cartItems = List<Map<String, dynamic>>.from(cartData);
          cartTotal = (responseData['cartTotal'] as num?)?.toDouble() ?? 0.0;
        });

        // Log cart items to see what data we're working with
        print('Cart Items: $cartItems'); // Print cart items to check if prodPrice is set

        print('Total Price: ${getTotalPrice()}');
      } else {
        print('❌ Failed to fetch cart. Status code: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Error fetching cart: $e');
    }
  }

  // Update quantity
  Future<void> _updateQuantity(int index, int newQuantity) async {
    final item = cartItems[index];
    final productId = item['productId']['_id'];
    final colorOptionId = item['colorOption'];
    final lensOptionId = item['lensOption'];
    final token = (await SharedPreferences.getInstance()).getString('token');

    print('Updating product: $productId');
    print('Color Option ID: $colorOptionId');
    print('Lens Option ID: $lensOptionId');
    print('New Quantity: $newQuantity');

    if (newQuantity <= 0) {
      cartItems.removeAt(index);
    } else {
      cartItems[index]['quantity'] = newQuantity;
    }

    setState(() {});

    final url = Uri.parse('http://10.0.2.2:3001/api/cart/update');
    final body = json.encode({
      'productId': productId,
      'colorOptionId': colorOptionId,
      'lensOptionId': lensOptionId,
      'quantity': newQuantity,
    });

    try {
      final response = await http.put(url, headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      }, body: body);

      print('Response Status: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        _fetchCart();
      } else {
        print('❌ Failed to update cart quantity: ${response.body}');
      }
    } catch (e) {
      print('❌ Error updating cart quantity: $e');
    }
  }

  // Calculate the total price
  double getTotalPrice() {
    double total = 0.0;

    for (var item in cartItems) {
      final product = item['productId']; // Access product details
      final lensOption = product['lensOptions'].firstWhere(
        (opt) => opt['_id'] == item['lensOption'],
        orElse: () => {},
      );

      // Get the price from product and lensOption
      final productPrice = product['price'] ?? 0.0;
      final lensPrice = lensOption['price'] ?? 0.0;
      final quantity = item['quantity'] ?? 1; // Default to 1 if quantity is missing

      // Calculate the total price by adding product and lens price
      final itemTotal = (productPrice + lensPrice) * quantity;

      // Add the item total to the grand total
      total += itemTotal;
    }

    print('Calculated Total Price: $total'); // Log for debugging
    return total;
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
                      final item = cartItems[index];
                      final product = item['productId'];
                      final colorOption = product['colorOptions'].firstWhere(
                        (opt) => opt['_id'] == item['colorOption'],
                        orElse: () => {},
                      );
                      final lensOption = product['lensOptions'].firstWhere(
                        (opt) => opt['_id'] == item['lensOption'],
                        orElse: () => {},
                      );
                      final quantity = item['quantity'] ?? 1;
                      final price =
                          ((product['price'] ?? 0) + (lensOption['price'] ?? 0)) * quantity;

                      return GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => DetailScreen(
                                productId: product['_id'],
                                prodName: product['name'],
                                prodSize: '',
                                prodPrice: product['price'].toString(),
                                numStars: product['numStars'] ?? 5,
                                quantity: quantity,
                                description: product['description'] ?? '[no description]',
                                prodImages: List<String>.from(product['imageUrls'] ?? []),
                                colorOptions: (product['colorOptions'] as List<dynamic>)
                                    .map((e) => ColorOption.fromJson(e))
                                    .toList(),
                                lensOptions: (product['lensOptions'] as List<dynamic>)
                                    .map((e) => LensOption.fromJson(e))
                                    .toList(),
                              ),
                            ),
                          );
                        },
                        child: CustomHorizontalProductCard(
                          productId: product['_id'],
                          prodName: product['name'],
                          prodPrice: 'PHP ${price.toStringAsFixed(2)}', // Corrected the PHP formatting here
                          numStars: product['numStars'] ?? 5,
                          quantity: quantity,
                          description: 'Frame in ${colorOption['name']}, ${lensOption['label']}',
                          selectedColorName: colorOption['name'],
                          selectedLensLabel: lensOption['label'],
                          prodImages: List<String>.from(product['imageUrls'] ?? []),
                          colorOptions: (product['colorOptions'] as List<dynamic>)
                              .map((e) => ColorOption.fromJson(e))
                              .toList(),
                          lensOptions: (product['lensOptions'] as List<dynamic>)
                              .map((e) => LensOption.fromJson(e))
                              .toList(),
                          isCart: true,
                          onAdd: () => _updateQuantity(index, quantity + 1), // Increase Quantity
                          onRemove: () => _updateQuantity(index, quantity - 1), // Decrease Quantity
                        ),
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
                    text: 'Total: ${getTotalPrice().toStringAsFixed(2)}', // Ensure to format to 2 decimal places
                    fontSize: ScreenUtil().setSp(20),
                    color: BLACK_COLOR,
                    fontWeight: FontWeight.bold,
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => CheckoutScreen(
                            totalAmount: getTotalPrice(), // Pass total amount to checkout
                          ),
                        ),
                      );
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
