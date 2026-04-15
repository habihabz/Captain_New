import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../models/customer.dart';
import '../utils/constants.dart';

class AccountInfoScreen extends StatefulWidget {
  const AccountInfoScreen({super.key});

  @override
  State<AccountInfoScreen> createState() => _AccountInfoScreenState();
}

class _AccountInfoScreenState extends State<AccountInfoScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  @override
  void initState() {
    super.initState();
    final customer = Provider.of<AuthProvider>(context, listen: false).customer;
    _nameController = TextEditingController(text: customer?.name ?? '');
    _emailController = TextEditingController(text: customer?.email ?? '');
    _phoneController = TextEditingController(text: customer?.phone ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Account Information', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildFieldLabel('Full Name'),
              _buildTextField(_nameController, Icons.person_outline_rounded, 'Enter your full name'),
              
              const SizedBox(height: 24),
              _buildFieldLabel('Email Address'),
              _buildTextField(_emailController, Icons.email_outlined, 'Enter your email', enabled: false),
              
              const SizedBox(height: 24),
              _buildFieldLabel('Phone Number'),
              _buildTextField(_phoneController, Icons.phone_android_rounded, 'Enter your phone number'),
              
              const SizedBox(height: 40),
              
              // Change Password Button
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/change-password'),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.lock_outline_rounded, size: 20, color: Colors.black87),
                      const SizedBox(width: 12),
                      Text('Change Password', style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 15)),
                      const Spacer(),
                      const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 60),
              
              // Save Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    // TODO: Implement profile update logic
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Profile updates coming soon!'))
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppConstants.primaryColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: Text('Save Changes', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        label,
        style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.grey[600]),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, IconData icon, String hint, {bool enabled = true}) {
    return Container(
      decoration: BoxDecoration(
        color: enabled ? Colors.grey[50] : Colors.grey[100],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: TextFormField(
        controller: controller,
        enabled: enabled,
        style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500, color: enabled ? Colors.black : Colors.grey),
        decoration: InputDecoration(
          hintText: hint,
          prefixIcon: Icon(icon, size: 20, color: Colors.grey[400]),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        ),
      ),
    );
  }
}
