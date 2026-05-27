import 'package:baobab_vision_project/models/productModel.dart';
import 'package:baobab_vision_project/screens/detail_screen.dart';
import 'package:baobab_vision_project/screens/checkout_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';
import 'package:baobab_vision_project/widgets/custom_horizontal_product_card.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> with WidgetsBindingObserver {
  List<Map<String, dynamic>> cartItems = [];
  double cartTotal = 0.0;
  bool _checkedClearedFlagOnce = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _fetchCart();
    SchedulerBinding.instance
        .addPostFrameCallback((_) => _checkCartClearedFlag());
  }

  Future<void> _fetchCart() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final userId = prefs.getString('userId');

    if (token == null || userId == null) return;

    final url = Uri.parse(
        'https://baobab-vision-project-0234.onrender.com/api/cart/$userId');
    final headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };

    try {
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        final cartData = responseData['cart']['items'] as List;

        setState(() {
          cartItems = List<Map<String, dynamic>>.from(cartData);
          cartTotal = (responseData['cartTotal'] as num?)?.toDouble() ?? 0.0;
        });
      }
    } catch (e) {
      print('❌ Error fetching cart: $e');
    }
  }

  Future<void> _checkCartClearedFlag() async {
    if (_checkedClearedFlagOnce) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final ts = prefs.getInt('cartClearedAt');
      if (ts != null && ts > 0) {
        await prefs.remove('cartClearedAt');
        await _fetchCart();
        setState(() {
          cartItems = [];
          cartTotal = 0.0;
        });
        _checkedClearedFlagOnce = true;
      }
    } catch (_) {}
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkCartClearedFlag();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  Future<void> _updateQuantity(int index, int newQuantity) async {
    final item = cartItems[index];
    final productId = item['productId']['_id'];
    final colorOptionId = item['colorOption'];
    final lensOptionId = item['lensOption'];
    final token = (await SharedPreferences.getInstance()).getString('token');

    if (newQuantity <= 0) {
      cartItems.removeAt(index);
    } else {
      cartItems[index]['quantity'] = newQuantity;
    }

    setState(() {});

    final url = Uri.parse(
        'https://baobab-vision-project-0234.onrender.com/api/cart/update');
    final body = json.encode({
      'productId': productId,
      'colorOptionId': colorOptionId,
      'lensOptionId': lensOptionId,
      'quantity': newQuantity,
    });

    try {
      final response = await http.put(url,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          body: body);

      if (response.statusCode == 200) {
        _fetchCart();
      } else {
        print('❌ Failed to update cart quantity: ${response.body}');
      }
    } catch (e) {
      print('❌ Error updating cart quantity: $e');
    }
  }

  double getTotalPrice() {
    double total = 0.0;

    for (var item in cartItems) {
      final product = item['productId'];
      final lensOption = product['lensOptions'].firstWhere(
        (opt) => opt['_id'] == item['lensOption'],
        orElse: () => {},
      );

      final productPrice = product['price'] ?? 0.0;
      final lensPrice = lensOption['price'] ?? 0.0;
      final quantity = item['quantity'] ?? 1;

      total += (productPrice + lensPrice) * quantity;
    }

    return total;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // Replace '/home' with your actual home route name or use pushReplacement with your Home widget
        Navigator.of(context).pushReplacementNamed('/home');
        return false;
      },
      child: Scaffold(
        backgroundColor: WHITE_COLOR,
        appBar: AppBar(
          systemOverlayStyle: const SystemUiOverlayStyle(
            statusBarColor: WHITE_COLOR,
            statusBarIconBrightness: Brightness.dark,
          ),
          title: CustomText(
            text: 'Shopping Cart',
            fontSize: 24.sp,
            color: BLACK_COLOR,
            fontWeight: FontWeight.bold,
          ),
          backgroundColor: WHITE_COLOR,
          elevation: 0, // removes the purple shadow
          iconTheme: const IconThemeData(color: BLACK_COLOR),
        ),
        body: Column(
          children: [
            Expanded(
              child: cartItems.isEmpty
                  ? Center(
                      child: CustomText(
                        text: 'Your cart is empty',
                        fontSize: 18.sp,
                        color: BLACK_COLOR,
                      ),
                    )
                  : ListView.builder(
                      padding: EdgeInsets.symmetric(vertical: 12.h),
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
                        final price = ((product['price'] ?? 0) +
                                (lensOption['price'] ?? 0)) *
                            quantity;

                        return Padding(
                          padding: EdgeInsets.symmetric(
                              horizontal: 16.w, vertical: 6.h),
                          child: Material(
                            elevation: 0, // remove purple shadow
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(15),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => DetailScreen(
                                      productId: product['_id'],
                                      prodName: product['name'],
                                      prodSize:
                                          '', // or provide a size if available
                                      prodPrice:
                                          (product['price'] ?? 0).toString(),
                                      numStars: product['numStars'] ?? 5,
                                      quantity: quantity,
                                      description: product['description'] ??
                                          'No description',
                                      prodImages: List<String>.from(
                                          product['imageUrls'] ?? []),
                                      colorOptions: (product['colorOptions']
                                              as List<dynamic>)
                                          .map((e) => ColorOption.fromJson(e))
                                          .toList(),
                                      lensOptions: (product['lensOptions']
                                              as List<dynamic>)
                                          .map((e) => LensOption.fromJson(e))
                                          .toList(),
                                    ),
                                  ),
                                );
                              },
                              child: Container(
                                decoration: BoxDecoration(
                                  color: WHITE_COLOR,
                                  borderRadius: BorderRadius.circular(15),
                                ),
                                child: CustomHorizontalProductCard(
                                  productId: product['_id'],
                                  prodName: product['name'],
                                  prodPrice: 'PHP ${price.toStringAsFixed(2)}',
                                  numStars: product['numStars'] ?? 5,
                                  quantity: quantity,
                                  description:
                                      'Frame in ${colorOption['name']}, ${lensOption['label']}',
                                  selectedColorName: colorOption['name'],
                                  selectedLensLabel: lensOption['label'],
                                  prodImages: List<String>.from(
                                      product['imageUrls'] ?? []),
                                  colorOptions:
                                      (product['colorOptions'] as List<dynamic>)
                                          .map((e) => ColorOption.fromJson(e))
                                          .toList(),
                                  lensOptions:
                                      (product['lensOptions'] as List<dynamic>)
                                          .map((e) => LensOption.fromJson(e))
                                          .toList(),
                                  isCart: true,
                                  onAdd: () =>
                                      _updateQuantity(index, quantity + 1),
                                  onRemove: () =>
                                      _updateQuantity(index, quantity - 1),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
            if (cartItems.isNotEmpty)
              Container(
                padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 18.h),
                decoration: BoxDecoration(
                  color: WHITE_COLOR, // changed from gray to white
                  border: Border(
                    top: BorderSide(color: Colors.grey.shade300, width: 1),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CustomText(
                          text: 'Total',
                          fontSize: 16.sp,
                          color: BLACK_COLOR,
                        ),
                        SizedBox(height: 5.h),
                        CustomText(
                          text: 'PHP ${getTotalPrice().toStringAsFixed(2)}',
                          fontSize: 20.sp,
                          color: BLACK_COLOR,
                          fontWeight: FontWeight.bold,
                        ),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => CheckoutScreen(
                              totalAmount: getTotalPrice(),
                            ),
                          ),
                        );
                        await _checkCartClearedFlag();
                        await _fetchCart();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: BLACK_COLOR,
                        padding: EdgeInsets.symmetric(
                            vertical: 14.h, horizontal: 40.w),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 4,
                      ),
                      child: CustomText(
                        text: 'Check Out',
                        fontSize: 16.sp,
                        color: WHITE_COLOR,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
