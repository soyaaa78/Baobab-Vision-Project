import 'dart:convert';
import 'api_client.dart';
import 'auth_storage.dart';

class OrderService {
  // Checkout from cart, returns orderId
  static Future<String?> checkoutFromCart({
    required String deliveryMethod, // 'Pick Up' or 'Third-Party Delivery'
    required String paymentMethod, // 'Pay Cash on Pickup' or 'Gcash'
    String? thirdPartyDelivery, // e.g., 'Lalamove'
    Map<String, dynamic>? addressDetails, // only for third-party delivery
    String? contactNumber,
    String? proofOfPaymentImage,
    String? referenceNumber,
  }) async {
    final body = <String, dynamic>{
      'deliveryMethod': deliveryMethod,
      'paymentMethod': paymentMethod,
      if (thirdPartyDelivery != null) 'thirdPartyDelivery': thirdPartyDelivery,
      if (contactNumber != null) 'contactNumber': contactNumber,
      if (proofOfPaymentImage != null)
        'proofOfPaymentImage': proofOfPaymentImage,
      if (referenceNumber != null) 'referenceNumber': referenceNumber,
    };

    final res = await ApiClient.postJson('/api/orders/checkout', body);
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final order = data['order'] as Map<String, dynamic>;
      final orderId = order['_id'] as String?;
      if (orderId != null) {
        await AuthStorage.setLastOrderId(orderId);
      }

      // If third-party delivery, create Address and attach to order
      if (deliveryMethod == 'Third-Party Delivery' &&
          addressDetails != null &&
          orderId != null) {
        final userId = await AuthStorage.getUserId();
        final addressBody = {
          'userId': userId,
          'orderId': orderId,
          ...addressDetails,
        };
        final addrRes = await ApiClient.postJson('/api/addresses', addressBody);
        if (addrRes.statusCode >= 200 && addrRes.statusCode < 300) {
          final addr = jsonDecode(addrRes.body) as Map<String, dynamic>;
          final addrId = (addr['address'] as Map<String, dynamic>)['_id'];
          await ApiClient.putJson(
              '/api/orders?id=$orderId', {'address': addrId});
        }
      }

      return orderId;
    }
    throw Exception(data['message'] ?? 'Checkout failed');
  }

  // Attach proof of payment to order: creates proof doc then updates order
  static Future<void> attachProofOfPayment({
    required String orderId,
    required String imageUrl,
    required String referenceNumber,
  }) async {
    final userId = await AuthStorage.getUserId();
    final createRes = await ApiClient.postJson('/api/proof-of-payment', {
      'userId': userId,
      'orderId': orderId,
      'proofOfPaymentImage': imageUrl,
      'referenceNumber': referenceNumber,
    });
    final data = jsonDecode(createRes.body) as Map<String, dynamic>;
    if (createRes.statusCode >= 200 && createRes.statusCode < 300) {
      final popId = (data['proofOfPayment'] as Map<String, dynamic>)['_id'];
      await ApiClient.putJson(
          '/api/orders?id=$orderId', {'proofOfPayment': popId});
      return;
    }
    throw Exception(data['message'] ?? 'Failed to create proof of payment');
  }
}
