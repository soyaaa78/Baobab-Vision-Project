import 'package:baobab_vision_project/screens/gcash_details_screen.dart';
import 'package:baobab_vision_project/screens/pending_orders_screen.dart';
import 'package:baobab_vision_project/screens/delivery_order_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';
import 'package:baobab_vision_project/services/order_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../widgets/custom_dialog.dart'; // ✅ Import your customDialog

class CheckoutScreen extends StatefulWidget {
  final double totalAmount;

  const CheckoutScreen({super.key, required this.totalAmount});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String selectedDeliveryMethod = 'Pick Up';
  String selectedPaymentMethod = 'Pay Cash';
  String? selectedThirdPartyService;

  String? selectedRegion;
  String? selectedProvince;
  String? selectedCity;
  String? selectedBarangay;

  List<String> provinces = [];
  List<String> cities = [];
  List<String> barangays = [];

  final TextEditingController nameController = TextEditingController();
  final TextEditingController contactController = TextEditingController();
  final TextEditingController postalCodeController = TextEditingController();
  final TextEditingController streetController = TextEditingController();

  bool lalamoveSubmitted = false;

  final Map<String, Map<String, Map<String, List<String>>>> philippinesRegions =
      {
    'NCR': {
      'Metro Manila': {
        'Binondo': [
          'Barangay 287',
          'Barangay 288',
          'Barangay 289',
          'Barangay 290',
          'Barangay 291',
          'Barangay 292',
          'Barangay 293',
          'Barangay 294',
          'Barangay 295',
          'Barangay 296'
        ],
      },
    },
    'Region 1': {
      'Ilocos Norte': {
        'Laoag City': ['Barangay A', 'Barangay B'],
      },
    },
  };

  @override
  void dispose() {
    nameController.dispose();
    contactController.dispose();
    postalCodeController.dispose();
    streetController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (selectedDeliveryMethod == 'Lalamove') {
      if (selectedThirdPartyService == null ||
          nameController.text.isEmpty ||
          contactController.text.isEmpty ||
          selectedRegion == null ||
          selectedProvince == null ||
          selectedCity == null ||
          selectedBarangay == null ||
          postalCodeController.text.isEmpty ||
          streetController.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please fill out all delivery details')),
        );
        return;
      }

      setState(() {
        lalamoveSubmitted = true;
      });

      // Submit order first
      await _submitOrder();

      // ✅ Use customDialog
      customDialog(
        context,
        title: "Order Confirmed",
        content:
            "Your order will be delivered via ${selectedThirdPartyService}. Staff will contact you on your number immediately for further instructions. Note that if you didn't answer the call 3 times, the order will be disregarded or cancelled.",
      );

      // After closing dialog, navigate
      Future.delayed(Duration(milliseconds: 10000), () {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
              builder: (context) => const DeliveryOrdersScreen()),
        );
      });
    } else {
      // Pick Up flow
      if (selectedPaymentMethod == 'Pay Cash') {
        // ✅ Use customDialog
        customDialog(
          context,
          title: "Order Confirmed",
          content: "Please pay the exact total amount of cash upon pickup.",
        );

        // After closing dialog, navigate
        Future.delayed(Duration(milliseconds: 7000), () {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => PendingOrdersScreen()),
          );
        });

        _submitOrder();
      } else if (selectedPaymentMethod == 'GCASH') {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => GcashDetailsScreen(
              gcashNumber: '0956-019-9236',
              totalAmount: widget.totalAmount,
              deliveryMethod: 'Pick Up',
            ),
          ),
        );
      }
    }
  }

  Future<void> _submitOrder() async {
    try {
      final isThirdParty = selectedDeliveryMethod == 'Lalamove';
      final addressDetails = isThirdParty
          ? {
              'fullName': nameController.text,
              'contactNumber': contactController.text,
              'region': selectedRegion,
              'province': selectedProvince,
              'city': selectedCity,
              'barangay': selectedBarangay,
              'postalCode': int.tryParse(postalCodeController.text),
              'addressDetails': streetController.text,
            }
          : null;

      await OrderService.checkoutFromCart(
        deliveryMethod: isThirdParty ? 'Third-Party Delivery' : 'Pick Up',
        paymentMethod:
            selectedPaymentMethod == 'GCASH' ? 'Gcash' : 'Pay Cash on Pickup',
        thirdPartyDelivery: isThirdParty ? selectedThirdPartyService : null,
        addressDetails: addressDetails,
        contactNumber:
            contactController.text.isNotEmpty ? contactController.text : null,
      );

      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(
          'cartClearedAt', DateTime.now().millisecondsSinceEpoch);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          behavior: SnackBarBehavior.floating,
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  Widget _buildCardSection({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(20.sp),
      margin: EdgeInsets.only(bottom: 20.h),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, 3))
        ],
      ),
      child: child,
    );
  }

  Widget _buildDropdown({
    required String? value,
    required String hint,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 15.w),
      decoration: BoxDecoration(
        color: WHITE_COLOR,
        border: Border.all(color: Colors.grey.shade400),
        borderRadius: BorderRadius.circular(10),
      ),
      child: DropdownButton<String>(
        isExpanded: true,
        value: value,
        hint: Text(hint),
        underline: SizedBox(),
        onChanged: onChanged,
        items: items
            .map((item) => DropdownMenuItem(value: item, child: Text(item)))
            .toList(),
      ),
    );
  }

  void _showThirdPartyInfoDialog() {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      backgroundColor: WHITE_COLOR, // 👈 full dialog background
      title: Text(
        "Third-Party Delivery Info",
        style: TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 20, // slightly bigger title
        ),
      ),
      content: Text(
        "By selecting third-party delivery, your order will be handled by your chosen delivery service (e.g., Lalamove, J&T, GrabExpress). Please ensure that your delivery details are complete and accurate.\n\n"
        "When you choose Third-Party Delivery, you’ll need to provide a few delivery details through the form. This helps us process your order and make sure your chosen courier has the correct information.\n\n"
        "After submitting the form, your order will appear in the Third Party Orders section. Here, you can easily track its progress through different statuses such as Pending, Processing, Ready for Shipment, In Transit, and Delivered.\n\n"
        "Please note that arranging the courier service, settling the delivery payment, and other related steps will be handled by both you and our staff outside the system. After you submit your delivery details, our staff will contact you to coordinate and finalize the process.",
        textAlign: TextAlign.justify,
        style: TextStyle(
          fontSize: 15, // increased by 1
          height: 1.5,  // better line spacing
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text("OK",   style: TextStyle(
              color: BLACK_COLOR, // 👈 make OK button black
              fontWeight: FontWeight.bold,),
        ),
        ),
      ],
    ),
  );
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        backgroundColor: WHITE_COLOR,
        elevation: 1,
        leading: BackButton(color: Colors.black),
        title: CustomText(
          text: 'Checkout',
          fontSize: ScreenUtil().setSp(25),
          fontWeight: FontWeight.bold,
          color: Colors.black,
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Delivery Method
            _buildCardSection(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CustomText(
                    text: 'Delivery Method',
                    fontSize: ScreenUtil().setSp(18),
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                  SizedBox(height: 15.h),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              selectedDeliveryMethod = 'Pick Up';
                              lalamoveSubmitted = false;
                              selectedThirdPartyService = null;
                            });
                          },
                          child: Container(
                            height: 50.h,
                            decoration: BoxDecoration(
                              color: selectedDeliveryMethod == 'Pick Up'
                                  ? Colors.black
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(15),
                              border: Border.all(
                                  color: selectedDeliveryMethod == 'Pick Up'
                                      ? Colors.black
                                      : Colors.grey.shade300,
                                  width: 2),
                            ),
                            child: Center(
                              child: CustomText(
                                text: 'Pick Up',
                                fontSize: ScreenUtil().setSp(16),
                                fontWeight: FontWeight.bold,
                                color: selectedDeliveryMethod == 'Pick Up'
                                    ? Colors.white
                                    : Colors.black,
                              ),
                            ),
                          ),
                        ),
                      ),
                      SizedBox(width: 10.w),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              selectedDeliveryMethod = 'Lalamove';
                              selectedThirdPartyService ??= 'Lalamove';
                            });
                          },
                          child: Container(
                            height: 50.h,
                            decoration: BoxDecoration(
                              color: selectedDeliveryMethod == 'Lalamove'
                                  ? Colors.black
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(15),
                              border: Border.all(
                                  color: selectedDeliveryMethod == 'Lalamove'
                                      ? Colors.black
                                      : Colors.grey.shade300,
                                  width: 2),
                            ),
                            child: Center(
                              child: CustomText(
                                text: 'Third-Party Delivery',
                                fontSize: ScreenUtil().setSp(13),
                                fontWeight: FontWeight.bold,
                                color: selectedDeliveryMethod == 'Lalamove'
                                    ? Colors.white
                                    : Colors.black,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Payment Method - Only visible for Pick Up
            if (selectedDeliveryMethod != 'Lalamove')
              _buildCardSection(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CustomText(
                      text: 'Payment Method',
                      fontSize: ScreenUtil().setSp(18),
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                    SizedBox(height: 15.h),
                    Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                selectedPaymentMethod = 'Pay Cash';
                              });
                            },
                            child: Container(
                              height: 50.h,
                              decoration: BoxDecoration(
                                color: selectedPaymentMethod == 'Pay Cash'
                                    ? Colors.black
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(15),
                                border: Border.all(
                                    color: selectedPaymentMethod == 'Pay Cash'
                                        ? Colors.black
                                        : Colors.grey.shade300,
                                    width: 2),
                              ),
                              child: Center(
                                child: CustomText(
                                  text: 'Pay Cash',
                                  fontSize: ScreenUtil().setSp(16),
                                  fontWeight: FontWeight.bold,
                                  color: selectedPaymentMethod == 'Pay Cash'
                                      ? Colors.white
                                      : Colors.black,
                                ),
                              ),
                            ),
                          ),
                        ),
                        SizedBox(width: 10.w),
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                selectedPaymentMethod = 'GCASH';
                              });
                            },
                            child: Container(
                              height: 50.h,
                              decoration: BoxDecoration(
                                color: selectedPaymentMethod == 'GCASH'
                                    ? Colors.black
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(15),
                                border: Border.all(
                                    color: selectedPaymentMethod == 'GCASH'
                                        ? Colors.black
                                        : Colors.grey.shade300,
                                    width: 2),
                              ),
                              child: Center(
                                child: CustomText(
                                  text: 'GCASH',
                                  fontSize: ScreenUtil().setSp(16),
                                  fontWeight: FontWeight.bold,
                                  color: selectedPaymentMethod == 'GCASH'
                                      ? Colors.white
                                      : Colors.black,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

            // Third-Party Delivery Form
            if (selectedDeliveryMethod == 'Lalamove')
              _buildCardSection(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
  mainAxisSize: MainAxisSize.min,
  children: [
    CustomText(
      text: 'Third-Party Delivery Details',
      fontSize: ScreenUtil().setSp(18),
      fontWeight: FontWeight.bold,
      color: Colors.black,
    ),
    GestureDetector(
      onTap: _showThirdPartyInfoDialog,
      child: Padding(
        padding: const EdgeInsets.only(left: 3), // adjust if needed
        child: Icon(
          Icons.info_outline,
          color: Colors.black,
          size: 18,
        ),
      ),
    ),
  ],
),
                    SizedBox(height: 15.h),
                    _buildDropdown(
                      value: selectedThirdPartyService,
                      hint: 'Select Delivery Service',
                      items: ['Lalamove', 'J&T', 'GrabExpress'],
                      onChanged: (val) {
                        setState(() {
                          selectedThirdPartyService = val;
                        });
                      },
                    ),
                    SizedBox(height: 10.h),
                    TextField(
                      controller: nameController,
                      decoration: InputDecoration(
                        labelText: 'Full Name',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        filled: true,
                        fillColor: WHITE_COLOR,
                      ),
                    ),
                    SizedBox(height: 10.h),
                    TextField(
                      controller: contactController,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        labelText: 'Contact Number',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        filled: true,
                        fillColor: WHITE_COLOR,
                      ),
                    ),
                    SizedBox(height: 10.h),
                    // Address Fields
                    _buildDropdown(
                      value: selectedRegion,
                      hint: 'Select Region',
                      items: philippinesRegions.keys.toList(),
                      onChanged: (val) {
                        setState(() {
                          selectedRegion = val;
                          selectedProvince = null;
                          selectedCity = null;
                          selectedBarangay = null;
                          provinces = val != null
                              ? philippinesRegions[val]!.keys.toList()
                              : [];
                          cities = [];
                          barangays = [];
                        });
                      },
                    ),
                    SizedBox(height: 10.h),
                    _buildDropdown(
                      value: selectedProvince,
                      hint: 'Select Province',
                      items: provinces,
                      onChanged: (val) {
                        setState(() {
                          selectedProvince = val;
                          selectedCity = null;
                          selectedBarangay = null;
                          cities = val != null
                              ? philippinesRegions[selectedRegion!]![val]!
                                  .keys
                                  .toList()
                              : [];
                          barangays = [];
                        });
                      },
                    ),
                    SizedBox(height: 10.h),
                    _buildDropdown(
                      value: selectedCity,
                      hint: 'Select City',
                      items: cities,
                      onChanged: (val) {
                        setState(() {
                          selectedCity = val;
                          selectedBarangay = null;
                          barangays = val != null
                              ? philippinesRegions[selectedRegion!]![
                                  selectedProvince!]![val]!
                              : [];
                        });
                      },
                    ),
                    SizedBox(height: 10.h),
                    _buildDropdown(
                      value: selectedBarangay,
                      hint: 'Select Barangay',
                      items: barangays,
                      onChanged: (val) {
                        setState(() {
                          selectedBarangay = val;
                        });
                      },
                    ),
                    SizedBox(height: 10.h),
                    TextField(
                      controller: postalCodeController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'Postal Code',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        filled: true,
                        fillColor: WHITE_COLOR,
                      ),
                    ),
                    SizedBox(height: 10.h),
                    TextField(
                      controller: streetController,
                      decoration: InputDecoration(
                        labelText: 'Street / Address Details',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        filled: true,
                        fillColor: WHITE_COLOR,
                      ),
                    ),
                  ],
                ),
              ),

            SizedBox(height: 20.h),
            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 55.h,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
                onPressed: _handleSubmit,
                child: CustomText(
                  text:
                      'Confirm Order - PHP ${widget.totalAmount.toStringAsFixed(2)}',
                  fontSize: ScreenUtil().setSp(18),
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            SizedBox(height: 30.h),
          ],
        ),
      ),
    );
  }
}