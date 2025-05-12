import 'package:baobab_vision_project/constants.dart';
import 'package:baobab_vision_project/widgets/custom_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:baobab_vision_project/screens/cart_screen.dart'; // Import CartScreen

class CartAnimationButton extends StatefulWidget {
  final VoidCallback onPressed;
  final String label;

  CartAnimationButton({required this.onPressed, required this.label});

  @override
  _CartAnimationButtonState createState() => _CartAnimationButtonState();
}

class _CartAnimationButtonState extends State<CartAnimationButton> {
  double scale = 1.0;

  bool isSnackbarShown = false; // Variable to track if the Snackbar has already been shown

  void _animateButton() {
    setState(() {
      scale = 1.2;  // Scale up
    });

    Future.delayed(Duration(milliseconds: 150), () {
      setState(() {
        scale = 1.0;  // Scale back to normal
      });
    });

    // Call the onPressed callback to perform the action
    widget.onPressed();

    // Show the Snackbar with a "View Cart" button, but only once
    if (!isSnackbarShown) {
      showAddToCartSnackbar(context);
      setState(() {
        isSnackbarShown = true;  // Mark the Snackbar as shown
      });

      // Reset the snackbar state after a delay to allow the next item to show the Snackbar
      Future.delayed(Duration(seconds: 2), () {
        setState(() {
          isSnackbarShown = false;  // Reset snackbar state
        });
      });
    }
  }

  // Function to display Snackbar with "View Cart" button
  void showAddToCartSnackbar(BuildContext context) {
    final snackBar = SnackBar(
      content: Text('Item added to cart!'),
      action: SnackBarAction(
        label: 'VIEW CART',
        onPressed: () {
          // Navigate to the CartScreen when the user clicks "View Cart"
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CartScreen(),
            ),
          ).then((_) {
            // Reset the isSnackbarShown flag when returning from the CartScreen
            setState(() {
              isSnackbarShown = false;
            });
          });
        },
      ),
    );

    // Show the snackbar
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedScale(
      scale: scale,
      duration: Duration(milliseconds: 150),
      child: ElevatedButton(
        onPressed: _animateButton,
        style: ElevatedButton.styleFrom(
          backgroundColor: BLACK_COLOR,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          minimumSize: const Size(double.infinity, 50),
        ),
        child: CustomText(
          text: widget.label,
          fontSize: ScreenUtil().setSp(15),
          color: Colors.white,
        ),
      ),
    );
  }
}
