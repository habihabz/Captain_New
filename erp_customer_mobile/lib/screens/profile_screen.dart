import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../providers/product_provider.dart';
import '../providers/cart_provider.dart';
import '../services/master_data_service.dart';
import '../models/master_data.dart';
import '../utils/constants.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final MasterDataService _masterDataService = MasterDataService();
  List<MasterData> _countries = [];
  bool _isLoadingCountries = false;

  Future<void> _showCountryPicker(BuildContext context) async {
    setState(() => _isLoadingCountries = true);
    final countries = await _masterDataService.getMasterDatasByType('Country');
    if (!mounted) return;
    setState(() {
      _countries = countries;
      _isLoadingCountries = false;
    });

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20))),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Select Region', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              Flexible(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: _countries.length,
                  itemBuilder: (context, index) {
                    final country = _countries[index];
                    final productProvider = Provider.of<ProductProvider>(context, listen: false);
                    final isSelected = productProvider.selectedCountryId == country.id;

                    return ListTile(
                      leading: const Icon(Icons.public),
                      title: Text(country.name, style: GoogleFonts.inter(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                      trailing: isSelected ? const Icon(Icons.check_circle, color: AppConstants.primaryColor) : null,
                      onTap: () async {
                        productProvider.setCountryId(country.id);
                        Provider.of<CartProvider>(context, listen: false).setCountryId(country.id);
                        
                        // Force refresh home data for new pricing
                        productProvider.fetchHomeData();
                        
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Region updated to ${country.name}'))
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final productProvider = Provider.of<ProductProvider>(context);
    final customer = auth.customer;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('My Profile', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Profile Header
            Center(
              child: Column(
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      color: AppConstants.primaryColor.withOpacity(0.05),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        customer?.name.isNotEmpty == true ? customer!.name[0].toUpperCase() : '?',
                        style: GoogleFonts.outfit(
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                          color: AppConstants.primaryColor,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    customer?.name ?? 'Guest User',
                    style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    customer?.email ?? 'No contact info',
                    style: GoogleFonts.inter(color: Colors.grey[500], fontSize: 13),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 40),
            
            _buildSectionHeader('General'),
            _buildMenuItem(
              icon: Icons.shopping_bag_outlined,
              title: 'Order History',
              onTap: () => Navigator.pushNamed(context, '/orders'),
            ),
            _buildMenuItem(
              icon: Icons.favorite_border_rounded,
              title: 'Favourites',
              onTap: () => Navigator.pushNamed(context, '/favorites'),
            ),

            const SizedBox(height: 10),
            _buildSectionHeader('Settings'),
            _buildMenuItem(
              icon: Icons.public_rounded,
              title: 'Country / Region',
              subtitle: 'Current Region ID: ${productProvider.selectedCountryId}',
              onTap: () => _showCountryPicker(context),
            ),
            _buildMenuItem(
              icon: Icons.person_outline_rounded,
              title: 'Account Information',
              onTap: () => Navigator.pushNamed(context, '/account'),
            ),
            
            const SizedBox(height: 30),
            
            // Logout
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  auth.logout();
                  Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red[50],
                  foregroundColor: Colors.red,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Text('Log out', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.only(left: 4, bottom: 12),
      child: Text(
        title,
        style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey[400]),
      ),
    );
  }

  Widget _buildMenuItem({required IconData icon, required String title, String? subtitle, required VoidCallback onTap}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        onTap: onTap,
        tileColor: Colors.grey[50],
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        leading: Icon(icon, color: Colors.black87, size: 22),
        title: Text(title, style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 15)),
        subtitle: subtitle != null ? Text(subtitle, style: GoogleFonts.inter(fontSize: 12, color: Colors.grey)) : null,
        trailing: const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
      ),
    );
  }
}
