import 'package:baobab_vision_project/screens/gcash_details_screen.dart';
import 'package:baobab_vision_project/screens/pending_orders_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';
import 'package:baobab_vision_project/services/order_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CheckoutScreen extends StatefulWidget {
  final double totalAmount;

  const CheckoutScreen({super.key, required this.totalAmount});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String selectedDeliveryMethod = 'Pick Up'; // 'Pick Up' or 'Lalamove'
  String selectedPaymentMethod = 'Pay Cash'; // 'Pay Cash' or 'GCASH'

  // Third-party delivery
  String? selectedThirdPartyService;

  // Cascading location dropdowns data (simplified example, add full data or fetch from API)
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
        'Caloocan City': [
          'Barangay 1',
          'Barangay 100',
          'Barangay 101',
          'Barangay 102',
          'Barangay 103',
          'Barangay 104',
          'Barangay 105',
          'Barangay 106',
          'Barangay 107',
          'Barangay 108',
          'Barangay 109',
          'Barangay 11',
          'Barangay 110',
          'Barangay 111',
          'Barangay 112',
          'Barangay 113',
          'Barangay 114',
          'Barangay 115',
          'Barangay 116',
          'Barangay 117',
          'Barangay 118',
          'Barangay 119',
          'Barangay 12',
          'Barangay 120',
          'Barangay 121',
          'Barangay 122',
          'Barangay 123',
          'Barangay 124',
          'Barangay 125',
          'Barangay 126',
          'Barangay 127',
          'Barangay 128',
          'Barangay 129',
          'Barangay 13',
          'Barangay 130',
          'Barangay 131',
          'Barangay 132',
          'Barangay 133',
          'Barangay 134',
          'Barangay 135',
          'Barangay 136',
          'Barangay 137',
          'Barangay 138',
          'Barangay 139',
          'Barangay 14',
          'Barangay 140',
          'Barangay 141',
          'Barangay 142',
          'Barangay 143',
          'Barangay 144',
          'Barangay 145',
          'Barangay 146',
          'Barangay 147',
          'Barangay 148',
          'Barangay 149',
          'Barangay 15',
          'Barangay 150',
          'Barangay 151',
          'Barangay 152',
          'Barangay 153',
          'Barangay 154',
          'Barangay 155',
          'Barangay 156',
          'Barangay 157',
          'Barangay 158',
          'Barangay 159',
          'Barangay 16',
          'Barangay 160',
          'Barangay 161',
          'Barangay 162',
          'Barangay 163',
          'Barangay 164',
          'Barangay 165',
          'Barangay 166',
          'Barangay 167',
          'Barangay 168',
          'Barangay 169',
          'Barangay 17',
          'Barangay 170',
          'Barangay 171',
          'Barangay 172',
          'Barangay 173',
          'Barangay 174',
          'Barangay 175',
          'Barangay 176',
          'Barangay 177',
          'Barangay 178',
          'Barangay 179',
          'Barangay 18',
          'Barangay 180',
          'Barangay 181',
          'Barangay 182',
          'Barangay 183',
          'Barangay 184',
          'Barangay 185',
          'Barangay 186',
          'Barangay 187',
          'Barangay 188',
          'Barangay 189',
          'Barangay 19',
          'Barangay 2',
          'Barangay 20',
          'Barangay 21',
          'Barangay 22',
          'Barangay 23',
          'Barangay 24',
          'Barangay 25',
          'Barangay 26',
          'Barangay 27',
          'Barangay 28',
          'Barangay 29',
          'Barangay 3',
          'Barangay 30',
          'Barangay 31',
          'Barangay 32',
          'Barangay 33',
          'Barangay 34',
          'Barangay 35',
          'Barangay 36',
          'Barangay 37',
          'Barangay 38' 'Barangay 39',
          'Barangay 4',
          'Barangay 40',
          'Barangay 41',
          'Barangay 42',
          'Barangay 43',
          'Barangay 44',
          'Barangay 45',
          'Barangay 46',
          'Barangay 47',
          'Barangay 48',
          'Barangay 49',
          'Barangay 5',
          'Barangay 50',
          'Barangay 51',
          'Barangay 52',
          'Barangay 53',
          'Barangay 54',
          'Barangay 55',
          'Barangay 56',
          'Barangay 57',
          'Barangay 58',
          'Barangay 59',
          'Barangay 6',
          'Barangay 60',
          'Barangay 61',
          'Barangay 62',
          'Barangay 63',
          'Barangay 64',
          'Barangay 65',
          'Barangay 66',
          'Barangay 67',
          'Barangay 68',
          'Barangay 69',
          'Barangay 7',
          'Barangay 70',
          'Barangay 71',
          'Barangay 72',
          'Barangay 73',
          'Barangay 74',
          'Barangay 75',
          'Barangay 76',
          'Barangay 77',
          'Barangay 78',
          'Barangay 79',
          'Barangay 8',
          'Barangay 80',
          'Barangay 81',
          'Barangay 81',
          'Barangay 82',
          'Barangay 83',
          'Barangay 84',
          'Barangay 85',
          'Barangay 86',
          'Barangay 87',
          'Barangay 88',
          'Barangay 89',
          'Barangay 9',
          'Barangay 90',
          'Barangay 91',
          'Barangay 92',
          'Barangay 93',
          'Barangay 94',
          'Barangay 95',
          'Barangay 96',
          'Barangay 97',
          'Barangay 98',
          'Barangay 99',
        ],
        'Ermita': [
          'Barangay 659',
          'Barangay 659-A',
          'Barangay 660',
          'Barangay 660-A',
          'Barangay 661',
          'Barangay 663',
          'Barangay 663-A',
          'Barangay 664',
          'Barangay 666',
          'Barangay 667',
          'Barangay 668',
          'Barangay 669',
          'Barangay 670',
        ],
        'Intramuros': [
          'Barangay 654',
          'Barangay 655',
          'Barangay 656',
          'Barangay 657',
          'Barangay 658',
        ],
        'Las Pinas City': [
          'Almanza Dos',
          'Almanza Uno',
          'B. F. International Village',
          'Daniel Fajardo',
          'Elias Aldana',
          'Ilaya',
          'Manuyo Dos',
          'Manuyo Uno',
          'Pamplona Dos',
          'Pamplona Tres',
          'Pamplona Uno',
          'Pilar',
          'Pulang Lupa Dos',
          'Pulang Lupa Uno',
          'Talon Dos',
          'Talon Kuatro',
          'Talon Singko',
          'Talon Tres',
          'Talon Uno',
          'Zapote'
        ],
        'Makati City': [
          'Bangkal',
          'Bel-air',
          'Carmona',
          'Cembo',
          'Comembo',
          'Dasmarinas',
          'East Rembo',
          'Forber Park',
          'Guadaluper Nuervo',
          'Guadalupe Viejo',
          'Kasilawan',
          'La Paz',
          'Magallanes',
          'Olympia',
          'Palanan',
          'Pembo',
          'Pinagkaisahan',
          'Pio Del Pilar',
          'Pitogo',
          'Poblacion',
          'Post Proper Northside',
          'Post Proper Southside',
          'Rizal',
          'San Antonio',
          'San Isidro',
          'San Lorenzo',
          'Santa Cruz',
          'Singkamas',
          'South Cembo',
          'Tejeros',
          'Urdaneta',
          'Valenzuela',
          'West Rembo'
        ],
        'Malabon City': [
          'Acacia',
          'Baritan',
          'Bayan-Bayanan',
          'Catmon',
          'Conception',
          'Dampalit',
          'Flores',
          'Halong Duhat',
          'Ibaba',
          'Longos',
          'Maysilo',
          'Muzon',
          'Niugan',
          'Panghulo',
          'Potrero',
          'San Agustin',
          'Santolan',
          'Tanong',
          'Tinajeros',
          'Tonsuya',
          'Tugatog'
        ],
        'Malate': [
          'Barangay 688',
          'Barangay 689',
          'Barangay 690',
          'Barangay 691',
          'Barangay 692',
          'Barangay 693',
          'Barangay 694',
          'Barangay 695',
          'Barangay 696',
          'Barangay 697',
          'Barangay 698',
          'Barangay 699',
          'Barangay 700',
          'Barangay 701',
          'Barangay 702',
          'Barangay 703',
          'Barangay 704',
          'Barangay 705',
          'Barangay 706',
          'Barangay 707',
          'Barangay 708',
          'Barangay 709',
          'Barangay 710',
          'Barangay 711',
          'Barangay 712',
          'Barangay 713',
          'Barangay 714',
          'Barangay 715',
          'Barangay 716',
          'Barangay 717',
          'Barangay 718',
          'Barangay 719',
          'Barangay 720',
          'Barangay 721',
          'Barangay 722',
          'Barangay 723',
          'Barangay 724',
          'Barangay 725',
          'Barangay 726',
          'Barangay 727',
          'Barangay 728',
          'Barangay 729',
          'Barangay 730',
          'Barangay 731',
          'Barangay 732',
          'Barangay 733',
          'Barangay 734',
          'Barangay 735',
          'Barangay 736',
          'Barangay 737',
          'Barangay 738',
          'Barangay 739',
          'Barangay 740',
          'Barangay 741',
          'Barangay 742',
          'Barangay 743',
          'Barangay 744'
        ],
        'Mandaluyong City': [
          'Addition Hills',
          'Bagong Silang',
          'Barangka Drive',
          'Barangka Ibaba',
          'Barangka Ilaya',
          'Barangka Itaas',
          'Barangka Bato',
          'Burol',
          'Daang Bakal',
          'Hagdang Bato Itaas',
          'Hagdang Bato Libis',
          'Harapin Ang Bukas',
          'Highway Hills',
          'Hulo',
          'Mabini-J Rizal',
          'Malamig',
          'Mauway',
          'Namayan',
          'New Zaniga',
          ' Old Zaniga',
          'Pag-asa',
          'Plainview',
          'Pleasant Hills',
          'Poblacion',
          ' San Jose',
          ' Vergara',
          'Wack-Wack Greenhills'
        ],
        'Marikina City': [
          'Barangka',
          'Calumpang',
          'Conception Dos',
          'Conception Uno',
          'Fortune',
          'Industrial Valley',
          'Jesus De La Pena',
          'Malanday',
          'Marikina Heights (Conception)',
          'Nangka',
          'Parang',
          'San Roque',
          'Santa Elena',
          'Santo Nino',
          'Tanong',
          'Tumana'
        ],
        'Muntinlupa City': [
          'Alabang',
          'Ayala Alabang',
          'Bayanan',
          'Buli',
          'Cupang',
          'Poblacion',
          'Putatan',
          'Sucat',
          'Tunasan'
        ],
        'Navotas City': [
          'Bagumbayan North',
          'Bagumbayan South',
          'Bangculasi',
          'Daanghari',
          'Navotas East',
          'Navotas West',
          'North Bay Blvd.',
          'San Jose',
          'San Rafael Village',
          'San Roque',
          'Sipac-Almacen',
          'Tangos',
          'Tanza'
        ],
        'Paco': [
          'Barangay 662',
          'Barangay 664-A',
          'Barangay 671',
          'Barangay 672',
          'Barangay 673',
          'Barangay 674',
          'Barangay 675',
          'Barangay 676',
          'Barangay 677',
          'Barangay 678',
          'Barangay 679',
          'Barangay 680',
          'Barangay 681',
          'Barangay 682',
          'Barangay 683',
          'Barangay 684',
          'Barangay 685',
          'Barangay 686',
          ' Barangay 687',
          'Barangay 688',
          'Barangay 689',
          'Barangay 690'
        ]
      },
    },
    'Region 1': {
      'Ilocos Norte': {
        'Laoag City': ['Barangay A', 'Barangay B'],
      },
    },
  };

  String? selectedRegion;
  String? selectedProvince;
  String? selectedCity;
  String? selectedBarangay;

  List<String> provinces = [];
  List<String> cities = [];
  List<String> barangays = [];

  // Delivery details controllers
  final TextEditingController nameController = TextEditingController();
  final TextEditingController contactController = TextEditingController();
  final TextEditingController postalCodeController = TextEditingController();
  final TextEditingController streetController = TextEditingController();

  bool lalamoveSubmitted = false;

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
      if (selectedThirdPartyService == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please select a delivery service')),
        );
        return;
      }

      // Validate all fields including location selections
      if (nameController.text.isEmpty ||
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

      // Save order with delivery info to backend
      _submitOrder();
    } else {
      if (selectedPaymentMethod == 'Pay Cash') {
        showDialog(
          context: context,
          barrierDismissible: false, // user must tap button
          builder: (BuildContext context) {
            return AlertDialog(
              title: Text('Order Confirmed'),
              content: Text(
                  'Please pay the exact total amount of cash upon pickup.'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop(); // close the dialog
                    // Navigate to Pending Orders screen
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                          builder: (context) => PendingOrdersScreen()),
                    );
                  },
                  child: Text('See Orders'),
                ),
              ],
            );
          },
        );
        // Save order with Pay Cash and Pick Up
        _submitOrder();
      } else if (selectedPaymentMethod == 'GCASH') {
        // Gather delivery and address context to be used when creating the order after upload
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

        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => GcashDetailsScreen(
              gcashNumber: '0956-019-9236',
              totalAmount: widget.totalAmount,
              deliveryMethod: isThirdParty ? 'Third-Party Delivery' : 'Pick Up',
              thirdPartyDelivery:
                  isThirdParty ? selectedThirdPartyService : null,
              contactNumber: contactController.text.isNotEmpty
                  ? contactController.text
                  : null,
              addressDetails: addressDetails,
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

      // Mark cart as cleared so CartScreen can refresh when revisited
      // (non-blocking, no UI changes)
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setInt(
            'cartClearedAt', DateTime.now().millisecondsSinceEpoch);
      } catch (_) {}
    } catch (e) {
      // Subtle error, but keep existing flow intact
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          behavior: SnackBarBehavior.floating,
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        backgroundColor: WHITE_COLOR,
        elevation: 0,
        leading: BackButton(color: Colors.black),
        title: CustomText(
          text: 'Checkout',
          fontSize: ScreenUtil().setSp(25),
          fontWeight: FontWeight.bold,
          color: Colors.black,
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 30.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Delivery Method Section
            CustomText(
              text: 'Delivery Method',
              fontSize: ScreenUtil().setSp(20),
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
                      height: 45.h,
                      padding: EdgeInsets.all(15.sp),
                      decoration: BoxDecoration(
                        color: selectedDeliveryMethod == 'Pick Up'
                            ? Colors.black
                            : Colors.white,
                        borderRadius: BorderRadius.circular(15),
                        border: Border.all(
                          color: selectedDeliveryMethod == 'Pick Up'
                              ? Colors.black
                              : Colors.grey.shade300,
                          width: 2,
                        ),
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
                        selectedPaymentMethod = 'Pay Cash';
                      });
                    },
                    child: Container(
                      padding: EdgeInsets.all(15.sp),
                      decoration: BoxDecoration(
                        color: selectedDeliveryMethod == 'Lalamove'
                            ? Colors.black
                            : Colors.white,
                        borderRadius: BorderRadius.circular(15),
                        border: Border.all(
                          color: selectedDeliveryMethod == 'Lalamove'
                              ? Colors.black
                              : Colors.grey.shade300,
                          width: 2,
                        ),
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
            SizedBox(height: 30.h),

            // PICK UP Section
            if (selectedDeliveryMethod == 'Pick Up') ...[
              CustomText(
                text: 'Payment Method',
                fontSize: ScreenUtil().setSp(20),
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
              SizedBox(height: 15.h),
              GestureDetector(
                onTap: () {
                  setState(() {
                    selectedPaymentMethod = 'Pay Cash';
                  });
                },
                child: Container(
                  padding: EdgeInsets.all(15.sp),
                  decoration: BoxDecoration(
                    color: selectedPaymentMethod == 'Pay Cash'
                        ? Colors.black
                        : Colors.white,
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(
                      color: selectedPaymentMethod == 'Pay Cash'
                          ? Colors.black
                          : Colors.grey.shade300,
                      width: 2,
                    ),
                    boxShadow: [
                      if (selectedPaymentMethod == 'Pay Cash')
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 8,
                          offset: Offset(0, 2),
                        )
                    ],
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.monetization_on_outlined,
                          size: 40.sp,
                          color: selectedPaymentMethod == 'Pay Cash'
                              ? Colors.white
                              : Colors.black),
                      SizedBox(width: 15.w),
                      Expanded(
                        child: CustomText(
                          text: 'Pay Cash on Pickup',
                          fontSize: ScreenUtil().setSp(18),
                          fontWeight: FontWeight.bold,
                          color: selectedPaymentMethod == 'Pay Cash'
                              ? Colors.white
                              : Colors.black,
                          maxLines: 1,
                        ),
                      ),
                      if (selectedPaymentMethod == 'Pay Cash')
                        Icon(Icons.check_circle,
                            color: Colors.green, size: 24.sp),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 15.h),
              GestureDetector(
                onTap: () {
                  setState(() {
                    selectedPaymentMethod = 'GCASH';
                  });
                },
                child: Container(
                  padding: EdgeInsets.all(15.sp),
                  decoration: BoxDecoration(
                    color: selectedPaymentMethod == 'GCASH'
                        ? Colors.black
                        : Colors.white,
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(
                      color: selectedPaymentMethod == 'GCASH'
                          ? Colors.black
                          : Colors.grey.shade300,
                      width: 2,
                    ),
                    boxShadow: [
                      if (selectedPaymentMethod == 'GCASH')
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 8,
                          offset: Offset(0, 2),
                        )
                    ],
                  ),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 40.w,
                        height: 40.h,
                        child: Image.asset(
                          'assets/images/gcash.png',
                          fit: BoxFit.contain,
                        ),
                      ),
                      SizedBox(width: 15.w),
                      Expanded(
                        child: CustomText(
                          text: 'GCASH',
                          fontSize: ScreenUtil().setSp(18),
                          fontWeight: FontWeight.bold,
                          color: selectedPaymentMethod == 'GCASH'
                              ? Colors.white
                              : Colors.black,
                          maxLines: 1,
                        ),
                      ),
                      if (selectedPaymentMethod == 'GCASH')
                        Icon(Icons.check_circle,
                            color: Colors.green, size: 24.sp),
                    ],
                  ),
                ),
              ),
            ]

            // THIRD-PARTY DELIVERY Section
            else if (selectedDeliveryMethod == 'Lalamove') ...[
              if (!lalamoveSubmitted) ...[
                CustomText(
                  text: 'Select Delivery Service',
                  fontSize: ScreenUtil().setSp(18),
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
                SizedBox(height: 10.h),

                Container(
                  padding: EdgeInsets.symmetric(horizontal: 15.w),
                  decoration: BoxDecoration(
                    color: WHITE_COLOR,
                    border: Border.all(color: Colors.grey.shade400),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: selectedThirdPartyService,
                    hint: Text('Choose a delivery service'),
                    underline: SizedBox(),
                    onChanged: (value) {
                      setState(() {
                        selectedThirdPartyService = value;
                      });
                    },
                    items: [
                      'Lalamove',
                      'J&T Express',
                      'GrabExpress',
                      'Ninja Van',
                      'Xend',
                    ].map((service) {
                      return DropdownMenuItem(
                        value: service,
                        child: Text(service),
                      );
                    }).toList(),
                  ),
                ),

                SizedBox(height: 20.h),

                CustomText(
                  text: 'Delivery Details',
                  fontSize: ScreenUtil().setSp(18),
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),

                SizedBox(height: 15.h),

                // Full Name TextField
                TextField(
                  controller: nameController,
                  decoration: InputDecoration(
                    labelText: 'Full Name',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),

                SizedBox(height: 15.h),

                // Contact Number TextField
                TextField(
                  controller: contactController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    labelText: 'Contact Number',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),

                SizedBox(height: 15.h),

                CustomText(
                  text: 'Address',
                  fontSize: ScreenUtil().setSp(18),
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
                SizedBox(height: 8.h),

                // REGION Dropdown
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 15.w),
                  decoration: BoxDecoration(
                    color: WHITE_COLOR,
                    border: Border.all(color: Colors.grey.shade400),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: selectedRegion,
                    hint: Text('Select Region'),
                    underline: SizedBox(),
                    onChanged: (value) {
                      setState(() {
                        selectedRegion = value;
                        selectedProvince = null;
                        selectedCity = null;
                        selectedBarangay = null;

                        provinces = value != null
                            ? philippinesRegions[value]!.keys.toList()
                            : [];
                        cities = [];
                        barangays = [];
                      });
                    },
                    items: philippinesRegions.keys.map((region) {
                      return DropdownMenuItem(
                        value: region,
                        child: Text(region),
                      );
                    }).toList(),
                  ),
                ),

                SizedBox(height: 15.h),

                // PROVINCE Dropdown
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 15.w),
                  decoration: BoxDecoration(
                    color: WHITE_COLOR,
                    border: Border.all(color: Colors.grey.shade400),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: selectedProvince,
                    hint: Text('Select Province'),
                    underline: SizedBox(),
                    onChanged: (value) {
                      setState(() {
                        selectedProvince = value;
                        selectedCity = null;
                        selectedBarangay = null;

                        cities = (selectedRegion != null && value != null)
                            ? philippinesRegions[selectedRegion]![value]!
                                .keys
                                .toList()
                            : [];
                        barangays = [];
                      });
                    },
                    items: provinces.map((province) {
                      return DropdownMenuItem(
                        value: province,
                        child: Text(province),
                      );
                    }).toList(),
                  ),
                ),

                SizedBox(height: 15.h),

                // CITY Dropdown
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 15.w),
                  decoration: BoxDecoration(
                    color: WHITE_COLOR,
                    border: Border.all(color: Colors.grey.shade400),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: selectedCity,
                    hint: Text('Select City'),
                    underline: SizedBox(),
                    onChanged: (value) {
                      setState(() {
                        selectedCity = value;
                        selectedBarangay = null;

                        barangays = (selectedRegion != null &&
                                selectedProvince != null &&
                                value != null)
                            ? philippinesRegions[selectedRegion]![
                                selectedProvince]![value]!
                            : [];
                      });
                    },
                    items: cities.map((city) {
                      return DropdownMenuItem(
                        value: city,
                        child: Text(city),
                      );
                    }).toList(),
                  ),
                ),

                SizedBox(height: 15.h),

                // BARANGAY Dropdown
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 15.w),
                  decoration: BoxDecoration(
                    color: WHITE_COLOR,
                    border: Border.all(color: Colors.grey.shade400),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: selectedBarangay,
                    hint: Text('Select Barangay'),
                    underline: SizedBox(),
                    onChanged: (value) {
                      setState(() {
                        selectedBarangay = value;
                      });
                    },
                    items: barangays.map((barangay) {
                      return DropdownMenuItem(
                        value: barangay,
                        child: Text(barangay),
                      );
                    }).toList(),
                  ),
                ),

                SizedBox(height: 15.h),

                // Postal Code TextField
                TextField(
                  controller: postalCodeController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Postal Code',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),

                SizedBox(height: 15.h),

                // Street/Building/House No TextField
                TextField(
                  controller: streetController,
                  decoration: InputDecoration(
                    labelText: 'Street name, building, house number',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),

                SizedBox(height: 30.h),

                ElevatedButton(
                  onPressed: _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    minimumSize: Size(double.infinity, 55.h),
                  ),
                  child: CustomText(
                    text: 'Submit Delivery Details',
                    fontSize: ScreenUtil().setSp(18),
                    color: Colors.white,
                  ),
                ),
              ] else ...[
                Center(
                  child: Column(
                    children: [
                      Icon(Icons.check_circle_outline,
                          size: 60.sp, color: Colors.green),
                      SizedBox(height: 15.h),
                      CustomText(
                        text:
                            'Thank you! Our staff will contact you at your number for the process of third-party delivery.',
                        fontSize: ScreenUtil().setSp(18),
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 30.h),
                    ],
                  ),
                ),
              ],
            ],
          ],
        ),
      ),
      bottomNavigationBar: selectedDeliveryMethod == 'Pick Up'
          ? Container(
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 15.h),
              decoration: BoxDecoration(
                color: WHITE_COLOR,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 10,
                    offset: Offset(0, -2),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      CustomText(
                        text: 'Total:',
                        fontSize: ScreenUtil().setSp(20),
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                      CustomText(
                        text: 'PHP ${widget.totalAmount.toStringAsFixed(2)}',
                        fontSize: ScreenUtil().setSp(20),
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ],
                  ),
                  SizedBox(height: 15.h),
                  SizedBox(
                    width: double.infinity,
                    height: 55.h,
                    child: ElevatedButton(
                      onPressed: _handleSubmit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: CustomText(
                        text: 'Confirm',
                        fontSize: ScreenUtil().setSp(18),
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            )
          : null,
    );
  }
}
