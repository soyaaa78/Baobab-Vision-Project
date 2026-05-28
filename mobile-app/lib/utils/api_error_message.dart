import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

String apiResponseMessage(String body, String fallback) {
  final rawBody = body.trim();
  if (rawBody.isEmpty) return fallback;

  try {
    final decoded = jsonDecode(rawBody);
    if (decoded is Map<String, dynamic> && decoded['message'] != null) {
      return decoded['message'].toString();
    }
  } on FormatException {
    return rawBody;
  }

  return rawBody;
}

Map<String, dynamic> apiResponseJson(String body) {
  try {
    final decoded = jsonDecode(body);
    return decoded is Map<String, dynamic> ? decoded : <String, dynamic>{};
  } on FormatException {
    return <String, dynamic>{};
  }
}

bool isNetworkFailure(Object error) {
  return error is SocketException ||
      error is TimeoutException ||
      error is http.ClientException;
}
