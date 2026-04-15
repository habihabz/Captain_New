import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _letterSpacingAnimation;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeIn),
      ),
    );

    _scaleAnimation = Tween<double>(begin: 0.7, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOutBack),
      ),
    );

    _letterSpacingAnimation = Tween<double>(begin: 2.0, end: 8.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.4, 1.0, curve: Curves.easeInOut),
      ),
    );

    _controller.forward();
    _checkAuthAfterDelay();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _checkAuthAfterDelay() async {
    try {
      // Minimum duration for the animation to look premium
      await Future.delayed(const Duration(milliseconds: 3000));
      
      if (!mounted) return;
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      
      // Initialize auth and check for server connectivity
      await authProvider.init().timeout(const Duration(seconds: 10), onTimeout: () {
        throw 'Connection Timeout. Please check your internet.';
      });
      
      if (!mounted) return;
      
      if (authProvider.isAuthenticated) {
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        Navigator.pushReplacementNamed(context, '/login');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = e.toString().contains('SocketException') 
            ? 'Unable to connect to the server.' 
            : e.toString());
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          Center(
            child: _errorMessage != null 
                ? _buildErrorState()
                : _buildSplashState(),
          ),
          // Copyright Footer
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Column(
                children: [
                   Text(
                    '© 2024 CAPTAIN LUXURY RETAIL',
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      letterSpacing: 2,
                      color: Colors.grey[400],
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'ALL RIGHTS RESERVED',
                    style: GoogleFonts.inter(
                      fontSize: 8,
                      letterSpacing: 1,
                      color: Colors.grey[300],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSplashState() {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Expanded Logo WITHOUT background
            Transform.scale(
              scale: _scaleAnimation.value,
              child: Opacity(
                opacity: _fadeAnimation.value,
                child: SizedBox(
                  height: 180, // Increased size
                  width: 180,
                  child: Image.asset(
                    'assets/logo.png',
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) => const Icon(Icons.shopping_bag_outlined, size: 80, color: Colors.black),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 30),
            // Brand Title
            Opacity(
              opacity: _fadeAnimation.value,
              child: Text(
                'CAPTAIN',
                style: GoogleFonts.outfit(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  letterSpacing: _letterSpacingAnimation.value,
                  color: Colors.black,
                ),
              ),
            ),
            const SizedBox(height: 12),
            // Tagline
            Opacity(
              opacity: _controller.value > 0.7 ? (_controller.value - 0.7) / 0.3 : 0.0,
              child: Text(
                'EXCLUSIVE SHOPPING',
                style: GoogleFonts.inter(
                  fontSize: 10,
                  letterSpacing: 4,
                  color: Colors.grey[400],
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildErrorState() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.cloud_off_rounded, size: 60, color: Colors.black12),
          const SizedBox(height: 24),
          Text(
            'Connection Error',
            style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Text(
            _errorMessage ?? 'Something went wrong while connecting to our servers.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 14, color: Colors.grey[500], height: 1.5),
          ),
          const SizedBox(height: 40),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: () {
                setState(() => _errorMessage = null);
                _controller.reset();
                _controller.forward();
                _checkAuthAfterDelay();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: Text('Retry Connection', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
