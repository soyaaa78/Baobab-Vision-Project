import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'api_client.dart';

class StorageService {
  static Future<String> uploadProofOfPayment(File file) async {
    final resp = await ApiClient.uploadSingleFile(
      '/api/storage/upload/proof-of-payment',
      'proofOfPayment',
      file,
    );
    final body = await http.Response.fromStream(resp);
    final data = jsonDecode(body.body) as Map<String, dynamic>;
    if (body.statusCode >= 200 && body.statusCode < 300) {
      return data['url'] as String;
    }
    throw Exception(data['message'] ?? 'Upload failed');
  }
}
