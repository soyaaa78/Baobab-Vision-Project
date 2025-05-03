import '../screens/cart_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/shop_screen.dart';
import '../screens/catalogue_screen.dart'; // Import CatalogueScreen
import 'package:flutter/material.dart';
import '../constants.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int selectedIndex = 0;
  final PageController pageController = PageController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        color: WHITE_COLOR,
        child: PageView(
          controller: pageController,
          children: const <Widget>[
            ShopScreen(),
            CatalogueScreen(), // Added CatalogueScreen
            CartScreen(),
            ProfileScreen(),
          ],
          onPageChanged: (page) {
            setState(() {
              selectedIndex = page;
            });
          },
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        showSelectedLabels: false,
        showUnselectedLabels: false,
        onTap: onTappedBar,
        backgroundColor: WHITE_COLOR,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_bag),
            label: 'Shop',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.auto_awesome_mosaic_outlined),
            label: 'Catalogue',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: 'Cart',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
        selectedItemColor: FIRST_COLOR,
        unselectedItemColor: BLACK_COLOR,
        currentIndex: selectedIndex,
      ),
    );
  }

  void onTappedBar(int value) {
    setState(() {
      selectedIndex = value;
      pageController.jumpToPage(value);
    });
  }
}
