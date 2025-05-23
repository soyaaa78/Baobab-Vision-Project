import 'package:baobab_vision_project/screens/forgot_password_screen.dart';
import 'package:baobab_vision_project/screens/login_screen.dart';
import 'package:baobab_vision_project/screens/register_screen.dart';
import 'package:baobab_vision_project/screens/splash_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '/screens/home_screen.dart';
 
void main() async {
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    systemNavigationBarColor: BLACK_COLOR, // navigation bar color
    statusBarIconBrightness: Brightness.dark, // status bar color
    statusBarColor: Colors.transparent,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));
  runApp(const BaobabVision());
}
 
class BaobabVision extends StatelessWidget {
  const BaobabVision({super.key});
 
  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(412, 715),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (_, child) {
        return MaterialApp(
          color: WHITE_COLOR,
          debugShowCheckedModeBanner: false,
          title: 'Baobab Vision',
          initialRoute: '/splash',
          routes: {
            '/home': (context) => const HomeScreen(),
            '/login': (context) => const LogInScreen(),
            '/register': (context) => const RegisterScreen(),
            '/splash': (context) => const SplashScreen(),
            '/forgot-password': (context) => const ForgotPasswordScreen(),
          },
        );
      },
    );
  }
}
 