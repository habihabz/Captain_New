import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../providers/product_provider.dart';
import '../providers/cart_provider.dart';
import '../services/master_data_service.dart';
import '../models/master_data.dart';
import '../utils/constants.dart';
import 'package:image_picker/image_picker.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final MasterDataService _masterDataService = MasterDataService();
  List<MasterData> _countries = [];

  Future<void> _pickAndUploadImage() async {
    final picker = ImagePicker();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    
    try {
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 70,
      );

      if (image != null) {
        final success = await auth.uploadProfileImage(image.path);
        if (mounted) {
          if (success) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Profile picture updated successfully'))
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(auth.errorMessage ?? 'Failed to upload image'), backgroundColor: Colors.red)
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error picking image: $e'), backgroundColor: Colors.red)
        );
      }
    }
  }

  Future<void> _showCountryPicker() async {
    final countries = await _masterDataService.getMasterDatasByType('Country');
    if (!mounted) return;
    setState(() {
      _countries = countries;
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
                    final isSelected = productProvider.selectedCountryId == country.md_id;

                    return ListTile(
                      leading: const Icon(Icons.public),
                      title: Text(country.md_name, style: GoogleFonts.inter(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                      trailing: isSelected ? const Icon(Icons.check_circle, color: AppConstants.primaryColor) : null,
                      onTap: () async {
                        productProvider.setCountryId(country.md_id);
                        Provider.of<CartProvider>(context, listen: false).setCountryId(country.md_id);
                        
                        // Force refresh home data for new pricing
                        productProvider.fetchHomeData();
                        
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Region updated to ${country.md_name}'))
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
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        title: Text('My Profile', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: const Color(0xFFF8F9FB),
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
                  GestureDetector(
                    onTap: _pickAndUploadImage,
                    child: Stack(
                      children: [
                        Container(
                          width: 90,
                          height: 90,
                          decoration: BoxDecoration(
                            color: AppConstants.primaryColor.withValues(alpha: 0.05),
                            shape: BoxShape.circle,
                            image: customer?.u_image_url != null && customer!.u_image_url!.isNotEmpty
                                ? DecorationImage(
                                    image: NetworkImage('${AppConstants.baseUrl}${customer.u_image_url}'),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                          ),
                          child: (customer?.u_image_url == null || customer!.u_image_url!.isEmpty)
                              ? Center(
                                  child: Text(
                                    customer?.u_name.isNotEmpty == true ? customer!.u_name[0].toUpperCase() : '?',
                                    style: GoogleFonts.outfit(
                                      fontSize: 36,
                                      fontWeight: FontWeight.bold,
                                      color: AppConstants.primaryColor,
                                    ),
                                  ),
                                )
                              : null,
                        ),
                        if (auth.isLoading)
                          Positioned.fill(
                            child: Container(
                              decoration: const BoxDecoration(
                                color: Colors.black26,
                                shape: BoxShape.circle,
                              ),
                              child: const Center(
                                child: SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                ),
                              ),
                            ),
                          ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: AppConstants.primaryColor,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.camera_alt_rounded, size: 14, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    customer?.u_name ?? 'Guest User',
                    style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    customer?.u_email ?? 'No contact info',
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
              onTap: () => _showCountryPicker(),
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
