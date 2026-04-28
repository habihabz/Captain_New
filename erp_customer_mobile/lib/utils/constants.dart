import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class AppConstants {
  // API URL
  // Set this to true to use production API, or let it follow kReleaseMode
  static const bool useProduction = kReleaseMode;

  static const String baseUrl = useProduction 
      ? 'https://api.husicaptain.com/' 
      : 'https://localhost:7299';
      
  static const String baseApiUrl = '$baseUrl/api';

  // Razorpay Key Placeholder
  static const String razorpayKey = 'rzp_test_qKiDdOgRFuLrJj';

  // Colors
  static const Color primaryColor = Color(0xFF000000); // Pure Black
  static const Color secondaryColor = Color(0xFF262626); // Dark Grey
  static const Color accentColor = Color(
    0xFFF59E0B,
  ); // Amber (Keeping for minor highlights)
  static const Color backgroundColor = Color(0xFFFFFFFF); // Pure White
  static const Color darkBackgroundColor = Color(0xFF000000); // Pure Black

  // Storage Keys
  static const String tokenKey = 'customertoken';
  static const String userDataKey = 'customer_data';

  // Delivery Constants
  static const double deliveryCharge = 40.0;
  static const double freeDeliveryThreshold = 1000.0;
}
