import 'package:flutter/material.dart';

class AppConstants {
  // API URL
  // For Android Emulator, use 10.0.2.2. For iOS or Web, use localhost or your machine's IP.
  static const String baseUrl = 'https://localhost:7299'; 
  static const String baseApiUrl = '$baseUrl/api';

  // Razorpay Key Placeholder
  static const String razorpayKey = 'YOUR_RAZORPAY_KEY';

  // Colors
  static const Color primaryColor = Color(0xFF000000); // Pure Black
  static const Color secondaryColor = Color(0xFF262626); // Dark Grey
  static const Color accentColor = Color(0xFFF59E0B); // Amber (Keeping for minor highlights)
  static const Color backgroundColor = Color(0xFFFFFFFF); // Pure White
  static const Color darkBackgroundColor = Color(0xFF000000); // Pure Black
  
  // Storage Keys
  static const String tokenKey = 'customertoken';
  static const String userDataKey = 'customer_data';
}
