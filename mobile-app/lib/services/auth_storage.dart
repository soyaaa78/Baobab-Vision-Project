import 'package:shared_preferences/shared_preferences.dart';

class AuthStorage {
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('userId');
  }

  static Future<void> setLastOrderId(String orderId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('lastOrderId', orderId);
  }

  static Future<String?> getLastOrderId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('lastOrderId');
  }
}
