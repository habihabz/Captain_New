import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../models/customer.dart';
import '../services/auth_service.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _dobController = TextEditingController();
  
  bool _isLoading = false;
  bool _isGetUpdates = false;
  bool _agreeTerms = false;
  DateTime? _selectedDob;

  final _authService = AuthService();
  final Color _accentColor = const Color(0xFF81E3D2);

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _dobController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDob ?? DateTime(2000),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: Colors.grey[800]!,
              onPrimary: Colors.white,
              onSurface: Colors.black,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _selectedDob) {
      setState(() {
        _selectedDob = picked;
        _dobController.text = DateFormat('dd/MM/yyyy').format(picked);
      });
    }
  }

  Future<void> _handleSignUp() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_agreeTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please agree to the Terms & Conditions')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final customer = Customer(
      u_name: _nameController.text,
      u_email: _emailController.text,
      u_phone: _phoneController.text,
      u_username: _usernameController.text,
      u_password: _passwordController.text,
      u_date_of_birth: _selectedDob?.toIso8601String(),
      u_is_get_updates: _isGetUpdates ? 'Y' : 'N',
      u_agree_terms: _agreeTerms ? 'Y' : 'N',
    );

    final result = await _authService.register(customer, _passwordController.text);

    if (mounted) {
      setState(() => _isLoading = false);
      if (result.status) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Welcome to Captain! Please login.')),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result.message), backgroundColor: Colors.redAccent),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, viewportConstraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 25),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: viewportConstraints.maxHeight,
                ),
                child: IntrinsicHeight(
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 500),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: 15),
                            // Logo
                            Image.asset('assets/logo.png', height: 75),
                            const SizedBox(height: 15),
                            Text(
                              'Create Your Account',
                              style: GoogleFonts.outfit(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1E293B),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Now let\'s make you a Captain Member.',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: const Color(0xFF64748B),
                              ),
                            ),
                            const SizedBox(height: 20),
                            
                            _buildFieldLabel('NAME'),
                            _buildTextField(_nameController, 'Enter your full name', Icons.person_outline, false),
                            
                            const SizedBox(height: 12),
                            _buildFieldLabel('PHONE'),
                            _buildTextField(_phoneController, 'Enter your phone number', Icons.phone_outlined, false),
                            
                            const SizedBox(height: 12),
                            _buildFieldLabel('EMAIL'),
                            _buildTextField(_emailController, 'Enter your email', Icons.mail_outline, false),
                            
                            const SizedBox(height: 12),
                            _buildFieldLabel('USERNAME'),
                            _buildTextField(_usernameController, 'Choose a username', null, false),
                            
                            const SizedBox(height: 12),
                            _buildFieldLabel('PASSWORD'),
                            _buildTextField(_passwordController, '••••••••', Icons.lock_outline, true),
                            
                            const SizedBox(height: 12),
                            _buildFieldLabel('DATE OF BIRTH'),
                            GestureDetector(
                              onTap: () => _selectDate(context),
                              child: AbsorbPointer(
                                child: _buildTextField(_dobController, 'dd/mm/yyyy', Icons.calendar_today_outlined, false, suffixIcon: Icons.calendar_today_rounded),
                              ),
                            ),
                            
                            const SizedBox(height: 15),
                            
                            // Checkboxes
                            _buildCheckbox(
                              value: _isGetUpdates,
                              onChanged: (v) => setState(() => _isGetUpdates = v!),
                              label: 'I want to receive product updates and Captain member benefits.',
                            ),
                            const SizedBox(height: 8),
                            _buildCheckbox(
                              value: _agreeTerms,
                              onChanged: (v) => setState(() => _agreeTerms = v!),
                              label: 'I agree to the ',
                              linkText: 'Terms & Conditions.',
                            ),
                            
                            const SizedBox(height: 25),
                            
                            // Signup Button
                            SizedBox(
                              width: double.infinity,
                              height: 52,
                              child: ElevatedButton(
                                onPressed: _isLoading ? null : _handleSignUp,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: _accentColor,
                                  foregroundColor: const Color(0xFF1E293B),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                                  elevation: 0,
                                ),
                                child: _isLoading
                                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF1E293B)))
                                    : Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            'SECURE SIGNUP',
                                            style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, letterSpacing: 1),
                                          ),
                                          const SizedBox(width: 8),
                                          const Icon(Icons.arrow_forward, size: 18),
                                        ],
                                      ),
                              ),
                            ),
                            
                            const SizedBox(height: 15),
                            
                            // Footer
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Already have an account? ',
                                  style: GoogleFonts.inter(color: Colors.grey[600], fontSize: 13),
                                ),
                                GestureDetector(
                                  onTap: () => Navigator.pop(context),
                                  child: Text(
                                    'Log In Now',
                                    style: GoogleFonts.inter(color: Colors.black, fontWeight: FontWeight.w700, fontSize: 13),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            // Copyright
                            Text(
                              '© 2026 Captain. All Rights Reserved.',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                color: const Color(0xFF94A3B8),
                                fontWeight: FontWeight.w500,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 20),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 8),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF94A3B8),
            letterSpacing: 1,
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint, IconData? icon, bool isPassword, {IconData? suffixIcon}) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: isPassword,
        style: GoogleFonts.inter(color: const Color(0xFF1E293B), fontWeight: FontWeight.w600),
        validator: (value) => (value == null || value.isEmpty) && !isPassword ? 'Required' : null,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: GoogleFonts.inter(color: const Color(0xFFCBD5E1), fontSize: 14),
          prefixIcon: icon != null ? Icon(icon, color: const Color(0xFF94A3B8), size: 18) : null,
          suffixIcon: suffixIcon != null ? Icon(suffixIcon, color: const Color(0xFF94A3B8), size: 18) : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
        ),
      ),
    );
  }

  Widget _buildCheckbox({required bool value, required Function(bool?) onChanged, required String label, String? linkText}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 24,
          width: 24,
          child: Checkbox(
            value: value,
            onChanged: onChanged,
            activeColor: const Color(0xFF3B82F6),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
            side: const BorderSide(color: Color(0xFFCBD5E1), width: 1.5),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 12, height: 1.4),
              children: [
                TextSpan(text: label),
                if (linkText != null)
                  TextSpan(
                    text: linkText,
                    style: const TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.w700),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
