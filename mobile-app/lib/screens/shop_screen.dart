import 'dart:async';
import 'dart:convert';
import 'package:baobab_vision_project/models/productModel.dart';
import 'package:baobab_vision_project/screens/detail_screen.dart';
import 'package:baobab_vision_project/screens/recommender_screen.dart';
import 'package:baobab_vision_project/screens/vto_screen.dart';
import 'package:baobab_vision_project/screens/profile_screen.dart'; // Added import for ProfileScreen
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:http/http.dart' as http;
import '../constants.dart';
import '../widgets/custom_text.dart';
import '../widgets/custom_vertical_product_card.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  String firstname = '';
  String token = '';
  String userId = '';
  List<dynamic> bestSellers = [];
  List<dynamic> forYou = [];
  List<String> slideshowImages = [];
  bool _isLoadingUser = true;

  String? profileImageUrl; // Added to hold profile image URL

  late PageController _pageController;
  int _currentPage = 0;
  Timer? _carouselTimer;

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
    fetchSlideshowImages();
    _pageController = PageController(initialPage: _currentPage);
    _startAutoSlide();
    fetchRecommendedProducts();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _carouselTimer?.cancel();
    super.dispose();
  }

  void _startAutoSlide() {
    _carouselTimer = Timer.periodic(Duration(seconds: 3), (Timer timer) {
      if (_pageController.hasClients && slideshowImages.isNotEmpty) {
        _currentPage++;
        if (_currentPage >= slideshowImages.length)
          _currentPage = 0; // Dynamic length
        _pageController.animateToPage(
          _currentPage,
          duration: Duration(milliseconds: 350),
          curve: Curves.easeIn,
        );
      }
    });
  }

  Future<void> _loadUserInfo() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();

    setState(() {
      firstname = prefs.getString('firstname') ?? 'Guest';
      token = prefs.getString('token') ?? '';
      userId = prefs.getString('userId') ?? '';
      profileImageUrl = prefs.getString('profileImageUrl'); // Load profile image URL here
      _isLoadingUser = false;
    });
  }

  Future<void> fetchSlideshowImages() async {
    try {
      final response = await http.get(
          Uri.parse('http://10.0.2.2:3001/api/slideshow/all-images'));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          slideshowImages = data.map((item) => item.toString()).toList();
        });
      } else {
        print('Failed to load slideshow images');
      }
    } catch (e) {
      print('Error fetching slideshow images: $e');
    }
  }

  Future<void> fetchRecommendedProducts() async {
    try {
      final response = await http
          .get(Uri.parse('http://10.0.2.2:3001/api/products/for-you'));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);

        setState(() {
          forYou = data; // Update the forYou list with the fetched data
        });
      } else {
        print('Failed to load recommended products');
      }
    } catch (e) {
      print('Error fetching recommended products: $e');
    }
  }

  // Build pagination dots
  Widget buildDot(int index, BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4),
      width: _currentPage == index ? 10 : 8,
      height: _currentPage == index ? 10 : 8,
      decoration: BoxDecoration(
        color: _currentPage == index ? Colors.red : Colors.grey,
        shape: BoxShape.circle,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    ImageProvider profileImageProvider;

    if (profileImageUrl != null && profileImageUrl!.isNotEmpty) {
      profileImageProvider = NetworkImage(profileImageUrl!);
    } else {
      profileImageProvider =
          const AssetImage('assets/images/default_profile_icon.jpg');
    }

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
            // Header Row with logo, greeting, and profile picture
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Logo & Greeting in Column
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Image.asset(
                      'assets/images/baobab_logo.png',
                      width: ScreenUtil().setSp(130),
                      height: ScreenUtil().setSp(60),
                    ),
                    SizedBox(height: ScreenUtil().setHeight(5)),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: _isLoadingUser
                          ? CircularProgressIndicator()
                          : CustomText(
                              text:
                                  'Good day, ${firstname.isNotEmpty ? firstname : 'Guest'}',
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
                  ],
                ),

                // Profile Picture clickable avatar on the right
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const ProfileScreen()),
                    );
                  },
                  child: CircleAvatar(
                    radius: ScreenUtil().setSp(25),
                    backgroundImage: profileImageProvider,
                    backgroundColor: Colors.grey.shade200,
                  ),
                ),
              ],
            ),

            SizedBox(height: ScreenUtil().setHeight(10)),

            // Virtual Try-On & Recommender Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Virtual Try-On Button
                Expanded(
                  child: Container(
                    margin: EdgeInsets.only(right: 10),
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) => VirtualTryOnScreen()),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: BLACK_COLOR,
                        padding: EdgeInsets.symmetric(vertical: 20),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        elevation: 8,
                        shadowColor: Colors.black45,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.add_a_photo,
                              size: 36, color: WHITE_COLOR),
                          SizedBox(height: 8),
                          Text(
                            'Virtual Try-On',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: WHITE_COLOR,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // Recommender Button
                Expanded(
                  child: Container(
                    margin: EdgeInsets.only(left: 10),
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) => RecommenderScreen()),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: BLACK_COLOR,
                        padding: EdgeInsets.symmetric(vertical: 20),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        elevation: 8,
                        shadowColor: Colors.black45,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.person, size: 36, color: WHITE_COLOR),
                          SizedBox(height: 8),
                          Text(
                            'Recommender',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: WHITE_COLOR,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),

            SizedBox(height: ScreenUtil().setHeight(20)),

            // Slideshow Section
            Column(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: SizedBox(
                    height: 150,
                    child: slideshowImages.isEmpty
                        ? Center(child: CircularProgressIndicator())
                        : PageView.builder(
                            controller: _pageController,
                            onPageChanged: (int index) {
                              setState(() {
                                _currentPage = index;
                              });
                            },
                            itemCount: slideshowImages.length,
                            itemBuilder: (context, index) {
                              return Image.network(
                                slideshowImages[index],
                                fit: BoxFit.cover,
                                width: double.infinity,
                                errorBuilder: (context, error, stackTrace) {
                                  return Center(
                                      child: Icon(Icons.broken_image));
                                },
                              );
                            },
                          ),
                  ),
                ),
                SizedBox(height: 10),
                slideshowImages.isEmpty
                    ? Container()
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          slideshowImages.length,
                          (index) => buildDot(index, context),
                        ),
                      ),
              ],
            ),

            SizedBox(height: ScreenUtil().setHeight(10)),

            // FOR YOU Section
            Align(
              alignment: Alignment.centerLeft,
              child: CustomText(
                text: 'RECOMMENDED FOR YOU',
                fontSize: ScreenUtil().setSp(15),
                color: BLACK_COLOR,
                fontWeight: FontWeight.w900,
              ),
            ),
            SizedBox(height: ScreenUtil().setHeight(5)),
            SizedBox(
              height: 225.0,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: forYou.length,
                itemBuilder: (context, index) {
                  var product = forYou[index];

                  // Safely handling the product image URLs and fallback
                  List<String> productImages =
                      (product['imageUrls'] != null &&
                              product['imageUrls'] is List)
                          ? List<String>.from(product['imageUrls'])
                          : [
                              'https://example.com/fallback-image.jpg'
                            ]; // Fallback image

                  return Padding(
                    padding:
                        EdgeInsets.only(right: ScreenUtil().setWidth(10)),
                    child: CustomVerticalProductCard(
                      prodName: product['name'] ?? 'Unknown',
                      prodSize: '${product['stock']} pcs Available',
                      prodPrice: '${product['price']} PHP',
                      numStars: product['numStars'] ?? 0,
                      quantity: product['stock'] ?? 1,
                      description: product['description'] ?? '',
                      prodImages: productImages,
                      productId: product['_id'] ?? product['productId'] ?? '',

                      // ✅ These two were missing
                      colorOptions: (product['colorOptions'] as List<dynamic>? ??
                              [])
                          .map((e) => ColorOption.fromJson(e))
                          .toList(),

                      lensOptions: (product['lensOptions'] as List<dynamic>? ?? [])
                          .map((e) => LensOption.fromJson(e))
                          .toList(),

                      // ✅ Optional defaults if you also added selected fields
                      selectedColorName: (product['colorOptions'] != null &&
                              product['colorOptions'] is List &&
                              product['colorOptions'].isNotEmpty &&
                              product['colorOptions'][0]['colorName'] != null)
                          ? product['colorOptions'][0]['colorName'] as String
                          : 'Default',

                      selectedLensLabel: (product['lensOptions'] != null &&
                              product['lensOptions'] is List &&
                              product['lensOptions'].isNotEmpty &&
                              product['lensOptions'][0]['label'] != null)
                          ? product['lensOptions'][0]['label'] as String
                          : 'Default',
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
