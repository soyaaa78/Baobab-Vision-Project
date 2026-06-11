import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'auth_storage.dart';

class ApiClient {
  static const String _configuredBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3001',
  );
  static final String baseUrl = _normalizeBaseUrl(_configuredBaseUrl);

  static String _normalizeBaseUrl(String raw) {
    final trimmed = raw.trim().replaceFirst(RegExp(r'/+$'), '');
    if (trimmed.endsWith('/api')) {
      return trimmed.substring(0, trimmed.length - 4);
    }
    return trimmed;
  }

  static Uri _buildUri(String path) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$baseUrl$normalizedPath');
  }

  static Future<Map<String, String>> _headers({bool json = true}) async {
    final token = await AuthStorage.getToken();
    final headers = <String, String>{};
    if (json) headers['Content-Type'] = 'application/json';
    if (token != null) headers['Authorization'] = 'Bearer $token';
    return headers;
  }

  static Future<http.Response> postJson(
      String path, Map<String, dynamic> body) async {
    final url = _buildUri(path);
    final headers = await _headers(json: true);
    return http.post(url, headers: headers, body: jsonEncode(body));
  }

  static Future<http.Response> putJson(
      String path, Map<String, dynamic> body) async {
    final url = _buildUri(path);
    final headers = await _headers(json: true);
    return http.put(url, headers: headers, body: jsonEncode(body));
  }

  static Future<http.StreamedResponse> uploadSingleFile(
    String path,
    String fieldName,
    File file,
  ) async {
    final url = _buildUri(path);
    final token = await AuthStorage.getToken();
    final request = http.MultipartRequest('POST', url);
    if (token != null) request.headers['Authorization'] = 'Bearer $token';
    request.files.add(await http.MultipartFile.fromPath(fieldName, file.path));
    return request.send();
  }

  // Upload multiple files under the same field name; returns a normal Response
  static Future<http.Response> uploadMultipleFiles(
    String path,
    String fieldName,
    List<File> files, {
    Map<String, String>? fields,
  }) async {
    final url = _buildUri(path);
    final token = await AuthStorage.getToken();
    final request = http.MultipartRequest('POST', url);
    if (token != null) request.headers['Authorization'] = 'Bearer $token';
    if (fields != null && fields.isNotEmpty) {
      request.fields.addAll(fields);
    }
    for (final file in files) {
      request.files
          .add(await http.MultipartFile.fromPath(fieldName, file.path));
    }
    final streamed = await request.send();
    return http.Response.fromStream(streamed);
  }

  static Future<http.Response> get(String path, {bool json = true}) async {
    final url = _buildUri(path);
    final headers = await _headers(json: json);
    return http.get(url, headers: headers);
  }
}
