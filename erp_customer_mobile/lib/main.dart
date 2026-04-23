import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/auth_provider.dart';
import 'providers/product_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/order_provider.dart';
import 'providers/favourite_provider.dart';
import 'providers/address_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/order_history_screen.dart';
import 'screens/order_details_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/favourite_screen.dart';
import 'screens/account_info_screen.dart';
import 'screens/change_password_screen.dart';
import 'screens/sign_up_screen.dart';
import 'utils/constants.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ProductProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => OrderProvider()),
        ChangeNotifierProvider(create: (_) => FavouriteProvider()),
        ChangeNotifierProvider(create: (_) => AddressProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Captain',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.white,
        colorScheme: ColorScheme.light(
          primary: AppConstants.primaryColor,
          secondary: AppConstants.secondaryColor,
          surface: Colors.white,
        ),
        textTheme: GoogleFonts.interTextTheme(),
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: GoogleFonts.outfit(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold),
        ),
      ),
      home: const SplashScreen(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/home': (context) => const HomeScreen(),
        '/cart': (context) => const CartScreen(),
        '/orders': (context) => const MyOrdersScreen(),
        '/order-details': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as int;
          return OrderDetailsScreen(orderId: args);
        },
        '/profile': (context) => const ProfileScreen(),
        '/favorites': (context) => const FavouritesScreen(),
        '/account': (context) => const AccountInfoScreen(),
        '/change-password': (context) => const ChangePasswordScreen(),
        '/signup': (context) => const SignUpScreen(),
      },
    );
  }
}
