import '../screens/cart_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/shop_screen.dart';
import '../screens/catalogue_screen.dart'; // Import CatalogueScreen
import 'package:flutter/material.dart';
import '../constants.dart';

class HomeScreen extends StatefulWidget {
  final int initialIndex;

  const HomeScreen({super.key, this.initialIndex = 0});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late int selectedIndex;
  late PageController pageController;

  @override
  void initState() {
    super.initState();
    selectedIndex = widget.initialIndex;
    pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        color: WHITE_COLOR,
        child: PageView(
          controller: pageController,
          children: const <Widget>[
            ShopScreen(),
            CatalogueScreen(),
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
      bottomNavigationBar: Theme(
        data: Theme.of(context).copyWith(
          // 👇 Force white background for BottomNavigationBar
          canvasColor: WHITE_COLOR,
        ),
        child: BottomNavigationBar(
          showSelectedLabels: false,
          showUnselectedLabels: false,
          onTap: onTappedBar,
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
