import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';
import '../providers/product_provider.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../services/payment_service.dart';
import '../providers/address_provider.dart';
import '../models/address.dart';
import '../utils/constants.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final TextEditingController _promoController = TextEditingController();
  bool _showDetails = false;
  bool _isProcessingPayment = false;
  late PaymentService _paymentService;

  @override
  void dispose() {
    _promoController.dispose();
    _paymentService.dispose();
    super.dispose();
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    final cartProvider = Provider.of<CartProvider>(context, listen: false);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final addressProvider = Provider.of<AddressProvider>(context, listen: false);

    final result = await cartProvider.placeOrder(
      customerId: auth.customer!.u_id,
      addressId: addressProvider.selectedAddress!.ad_id,
      paymentId: response.paymentId ?? '',
    );

    if (result.status && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Order placed successfully!'), backgroundColor: Colors.green),
      );
      Navigator.pushReplacementNamed(context, '/orders');
    } else {
      if (mounted) setState(() => _isProcessingPayment = false);
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    setState(() => _isProcessingPayment = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Payment Failed: ${response.message}'), backgroundColor: Colors.red),
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    setState(() => _isProcessingPayment = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('External Wallet: ${response.walletName}'), backgroundColor: Colors.blue),
    );
  }

  @override
  void initState() {
    super.initState();
    _paymentService = PaymentService(
      onSuccess: _handlePaymentSuccess,
      onError: _handlePaymentError,
      onExternalWallet: _handleExternalWallet,
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final productProvider = Provider.of<ProductProvider>(context, listen: false);
      final cartProvider = Provider.of<CartProvider>(context, listen: false);
      final addressProvider = Provider.of<AddressProvider>(context, listen: false);

      if (auth.isAuthenticated) {
        cartProvider.setCountryId(productProvider.selectedCountryId);
        cartProvider.fetchCart(auth.customer!.u_id);
        addressProvider.fetchAddresses(auth.customer!.u_id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = Provider.of<CartProvider>(context);
    final auth = Provider.of<AuthProvider>(context);
    final addressProvider = Provider.of<AddressProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('My Cart', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
      ),
      body: cartProvider.isLoading && cartProvider.cartItems.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : cartProvider.cartItems.isEmpty
              ? _buildEmptyState()
              : LayoutBuilder(
                  builder: (context, constraints) {
                    bool isDesktop = constraints.maxWidth > 900;
                    
                    return Center(
                      child: ConstrainedBox(
                        constraints: BoxConstraints(maxWidth: isDesktop ? 1200 : double.infinity),
                        child: isDesktop 
                          ? _buildDesktopLayout(cartProvider, auth, addressProvider)
                          : _buildMobileLayout(cartProvider, auth, addressProvider),
                      ),
                    );
                  },
                ),
    );
  }

  Widget _buildMobileLayout(CartProvider cartProvider, AuthProvider auth, AddressProvider addressProvider) {
    return Column(
      children: [
        Expanded(child: _buildCartList(cartProvider, auth.customer!.u_id, true)),
        _buildPromoCodeSection(cartProvider),
        _buildAddressSection(addressProvider),
        _buildCheckoutPanel(cartProvider),
      ],
    );
  }

  Widget _buildDesktopLayout(CartProvider cartProvider, AuthProvider auth, AddressProvider addressProvider) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left Side: Cart Items (Scrollable)
          Expanded(
            flex: 3,
            child: SingleChildScrollView(
              child: _buildCartList(cartProvider, auth.customer!.u_id, false),
            ),
          ),
          const SizedBox(width: 32),
          // Right Side: Summary & Checkout
          Expanded(
            flex: 2,
            child: SingleChildScrollView(
              child: Column(
                children: [
                  _buildAddressSection(addressProvider, isFloating: true),
                  const SizedBox(height: 16),
                  _buildPromoCodeSection(cartProvider, isFloating: true),
                  const SizedBox(height: 16),
                  _buildDesktopSummaryCard(cartProvider),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDesktopSummaryCard(CartProvider cartProvider) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Order Summary', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          _priceRow('Subtotal', '${cartProvider.currencySymbol}${cartProvider.subtotalAmount.toStringAsFixed(2)}'),
          const SizedBox(height: 12),
          _priceRow('Inclusive GST (${cartProvider.gstRate.toStringAsFixed(0)}%)', '${cartProvider.currencySymbol}${cartProvider.gstAmount.toStringAsFixed(2)}', valueColor: Colors.grey[400]),
          const SizedBox(height: 12),
          _priceRow('Delivery Fee', cartProvider.deliveryFee == 0 ? 'FREE' : '${cartProvider.currencySymbol}${cartProvider.deliveryFee.toStringAsFixed(2)}', 
            valueColor: cartProvider.deliveryFee == 0 ? const Color(0xFF10B981) : Colors.black),
          if (cartProvider.discountAmount > 0) ...[
            const SizedBox(height: 12),
            _priceRow('Discount', '-${cartProvider.currencySymbol}${cartProvider.discountAmount.toStringAsFixed(2)}', valueColor: const Color(0xFF10B981)),
          ],
          const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: Divider()),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold)),
              Text('${cartProvider.currencySymbol}${cartProvider.grandTotal.toStringAsFixed(2)}', 
                style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black)),
            ],
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: () => _handleCheckoutClick(cartProvider),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              child: cartProvider.isLoading 
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : Text('Checkout Now', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  void _handleCheckoutClick(CartProvider cartProvider) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final addressProvider = Provider.of<AddressProvider>(context, listen: false);
    
    if (addressProvider.selectedAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a delivery address'), backgroundColor: Colors.orange),
      );
      return;
    }

    _startPayment(cartProvider, auth, addressProvider.selectedAddress!);
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_bag_outlined, size: 80, color: Colors.grey[100]),
          const SizedBox(height: 16),
          Text('Your cart is empty', style: GoogleFonts.outfit(fontSize: 20, color: Colors.grey[400], fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppConstants.primaryColor,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('Start Shopping', style: GoogleFonts.inter(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildCartList(CartProvider cartProvider, int customerId, bool isMobile) {
    return ListView.builder(
      shrinkWrap: !isMobile,
      physics: isMobile ? const AlwaysScrollableScrollPhysics() : const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.symmetric(horizontal: isMobile ? 20 : 0, vertical: 10),
      itemCount: cartProvider.cartItems.length,
      itemBuilder: (context, index) {
        final item = cartProvider.cartItems[index];
        final imageUrl = (item.product?.imageList.isNotEmpty ?? false)
            ? '${AppConstants.baseUrl}/${item.product!.imageList[0]}'
            : '';

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.grey[100]!),
          ),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: imageUrl.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: imageUrl,
                        width: 85,
                        height: 85,
                        fit: BoxFit.contain,
                      )
                    : Container(width: 85, height: 85, color: Colors.grey[50], child: const Icon(Icons.image_outlined)),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.product?.p_name ?? 'Product', 
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 15),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Size: ${item.c_size_name}  |  Color: ${item.c_color_name}', 
                      style: GoogleFonts.inter(color: Colors.grey[500], fontSize: 12),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '₹${item.c_price.toStringAsFixed(2)}', 
                          style: GoogleFonts.outfit(color: AppConstants.primaryColor, fontWeight: FontWeight.bold, fontSize: 17)
                        ),
                        _qtySelector(item, cartProvider, customerId),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAddressSection(AddressProvider addressProvider, {bool isFloating = false}) {
    final address = addressProvider.selectedAddress;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: isFloating ? BorderRadius.circular(24) : BorderRadius.zero,
        border: isFloating ? Border.all(color: Colors.grey[100]!) : Border(top: BorderSide(color: Colors.grey[100]!)),
        boxShadow: isFloating ? [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10)] : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'DELIVERY ADDRESS',
                style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: const Color(0xFF94A3B8), letterSpacing: 1),
              ),
              GestureDetector(
                onTap: () => _showAddressPicker(addressProvider),
                child: Text(
                  'CHANGE',
                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: const Color(0xFF3B82F6), letterSpacing: 1),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (addressProvider.isLoading)
            const SizedBox(height: 40, child: Center(child: LinearProgressIndicator()))
          else if (address == null)
            _buildNoAddressState()
          else
            Row(
              children: [
                const Icon(Icons.location_on_outlined, color: Colors.black, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        address.ad_name,
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      Text(
                        '${address.ad_address}, ${address.ad_pincode}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(color: Colors.grey[500], fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildNoAddressState() {
    return GestureDetector(
      onTap: () {
        final auth = Provider.of<AuthProvider>(context, listen: false);
        _showAddAddressDialog(auth.customer!.u_id);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            const Icon(Icons.add_location_alt_outlined, color: Colors.grey, size: 20),
            const SizedBox(width: 12),
            Text('Add a delivery address to continue', style: GoogleFonts.inter(color: Colors.grey[500], fontSize: 13)),
          ],
        ),
      ),
    );
  }

  void _showAddAddressDialog(int customerId) {
    final nameController = TextEditingController();
    final addressController = TextEditingController();
    final phoneController = TextEditingController();
    final pincodeController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Add New Address', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Full Name')),
              TextField(controller: addressController, decoration: const InputDecoration(labelText: 'Address Detail')),
              TextField(controller: phoneController, decoration: const InputDecoration(labelText: 'Phone Number')),
              TextField(controller: pincodeController, decoration: const InputDecoration(labelText: 'Pincode'), keyboardType: TextInputType.number),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isNotEmpty && addressController.text.isNotEmpty) {
                final newAddress = Address(
                  ad_name: nameController.text,
                  ad_address: addressController.text,
                  ad_phone: phoneController.text,
                  ad_pincode: int.tryParse(pincodeController.text) ?? 0,
                  ad_is_default_yn: 'Y',
                );
                final success = await Provider.of<AddressProvider>(context, listen: false).addAddress(newAddress, customerId);
                if (!mounted) return;
                if (success) Navigator.pop(context);
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showAddressPicker(AddressProvider provider) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(30))),
      builder: (context) {
        return Container(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 30, right: 30, top: 30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Choose Delivery Address', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold)),
                  IconButton(
                    onPressed: () {
                      Navigator.pop(context);
                      final auth = Provider.of<AuthProvider>(context, listen: false);
                      _showAddAddressDialog(auth.customer!.u_id);
                    },
                    icon: const Icon(Icons.add_circle_outline),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              if (provider.addresses.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Center(child: Text('No addresses found', style: GoogleFonts.inter(color: Colors.grey))),
                )
              else
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: provider.addresses.length,
                    itemBuilder: (context, index) {
                      final addr = provider.addresses[index];
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        onTap: () {
                          provider.selectAddress(addr);
                          Navigator.pop(context);
                        },
                        leading: Icon(
                          addr.ad_id == provider.selectedAddress?.ad_id ? Icons.check_circle : Icons.circle_outlined,
                          color: addr.ad_id == provider.selectedAddress?.ad_id ? Colors.black : Colors.grey[300],
                        ),
                        title: Text(addr.ad_name, style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14)),
                        subtitle: Text(addr.ad_address, maxLines: 1, overflow: TextOverflow.ellipsis, style: GoogleFonts.inter(fontSize: 12)),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  Widget _qtySelector(item, cartProvider, customerId) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            onPressed: () { if (item.c_qty > 1) cartProvider.updateQuantity(item.c_id, item.c_qty - 1, customerId); },
            icon: const Icon(Icons.remove, size: 16),
            padding: const EdgeInsets.all(4),
            constraints: const BoxConstraints(),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Text('${item.c_qty}', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          ),
          IconButton(
            onPressed: () => cartProvider.updateQuantity(item.c_id, item.c_qty + 1, customerId),
            icon: const Icon(Icons.add, size: 16),
            padding: const EdgeInsets.all(4),
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }

  Widget _buildPromoCodeSection(CartProvider cartProvider, {bool isFloating = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: isFloating ? BorderRadius.circular(24) : BorderRadius.zero,
        border: isFloating ? Border.all(color: Colors.grey[100]!) : Border(top: BorderSide(color: Colors.grey[100]!)),
        boxShadow: isFloating ? [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10)] : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'COUPON CODE',
            style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: const Color(0xFF94A3B8), letterSpacing: 1),
          ),
          const SizedBox(height: 12),
          if (cartProvider.appliedPromoCode != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.confirmation_number_outlined, color: Color(0xFF16A34A), size: 18),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${cartProvider.appliedPromoCode!.pc_code} Applied',
                          style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13, color: const Color(0xFF16A34A)),
                        ),
                        Text(
                          'You saved ${cartProvider.currencySymbol}${cartProvider.discountAmount.toStringAsFixed(2)}',
                          style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF16A34A).withValues(alpha: 0.8)),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () => cartProvider.removePromoCode(),
                    child: Text('REMOVE', style: GoogleFonts.inter(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
              ),
            )
          else
            Row(
              children: [
                Expanded(
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey[200]!),
                    ),
                    child: TextField(
                      controller: _promoController,
                      style: GoogleFonts.inter(fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Enter coupon code',
                        hintStyle: GoogleFonts.inter(color: Colors.grey[400], fontSize: 14),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (_promoController.text.isNotEmpty) {
                        final result = await cartProvider.applyPromoCode(_promoController.text);
                        if (!result.status && mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(result.message), backgroundColor: Colors.red),
                          );
                        } else {
                          _promoController.clear();
                        }
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: Text('Apply', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  void _startPayment(CartProvider cartProvider, AuthProvider auth, Address selectedAddress) async {
    setState(() => _isProcessingPayment = true);
    
    // 1. Create Order ID from Backend (Crucial for stability)
    final orderId = await _paymentService.createPaymentOrder(cartProvider.grandTotal);
    
    if (orderId == null) {
      if (mounted) {
        setState(() => _isProcessingPayment = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to initiate payment. Please try again.'), backgroundColor: Colors.red),
        );
      }
      return;
    }

    // 2. Start Razorpay with the Order ID
    _paymentService.startPayment(
      amount: cartProvider.grandTotal,
      name: 'Captain',
      description: 'Order Payment - ${cartProvider.currencySymbol}${cartProvider.grandTotal.toStringAsFixed(2)}',
      contact: auth.customer?.u_phone ?? '',
      email: auth.customer?.u_email ?? '',
      orderId: orderId,
    );
  }

  Widget _buildCheckoutPanel(CartProvider cartProvider) {
    if (_isProcessingPayment) return const SizedBox.shrink();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 20, offset: const Offset(0, -5))],
        borderRadius: const BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_showDetails) ...[
                _priceRow('Item Total', '${cartProvider.currencySymbol}${cartProvider.subtotalAmount.toStringAsFixed(2)}'),
                const SizedBox(height: 8),
                _priceRow('Inclusive GST (${cartProvider.gstRate.toStringAsFixed(0)}%)', '${cartProvider.currencySymbol}${cartProvider.gstAmount.toStringAsFixed(2)}', valueColor: Colors.grey[400]),
                const SizedBox(height: 8),
                _priceRow('Delivery Fee', cartProvider.deliveryFee == 0 ? 'FREE' : '${cartProvider.currencySymbol}${cartProvider.deliveryFee.toStringAsFixed(2)}', 
                  valueColor: cartProvider.deliveryFee == 0 ? const Color(0xFF10B981) : Colors.black),
                if (cartProvider.discountAmount > 0) ...[
                  const SizedBox(height: 8),
                  _priceRow('Discount', '-${cartProvider.currencySymbol}${cartProvider.discountAmount.toStringAsFixed(2)}', valueColor: const Color(0xFF10B981)),
                ],
                const SizedBox(height: 16),
                const Divider(height: 1),
                const SizedBox(height: 16),
              ],
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                    onTap: () => setState(() => _showDetails = !_showDetails),
                    child: Row(
                      children: [
                        Text(
                          'Total Amount', 
                          style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey[600])
                        ),
                        Icon(_showDetails ? Icons.keyboard_arrow_down : Icons.keyboard_arrow_up, size: 18, color: Colors.grey[600]),
                      ],
                    ),
                  ),
                  Text(
                    '${cartProvider.currencySymbol}${cartProvider.grandTotal.toStringAsFixed(2)}', 
                    style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black)
                  ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: () {
                    final auth = Provider.of<AuthProvider>(context, listen: false);
                    final addressProvider = Provider.of<AddressProvider>(context, listen: false);
                    
                    if (addressProvider.selectedAddress == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please select a delivery address'), backgroundColor: Colors.orange),
                      );
                      return;
                    }

                    _startPayment(cartProvider, auth, addressProvider.selectedAddress!);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppConstants.primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: cartProvider.isLoading 
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text('Checkout Now', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _priceRow(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.inter(color: Colors.grey[500], fontSize: 13, fontWeight: FontWeight.w500)),
        Text(value, style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 14, color: valueColor ?? Colors.black)),
      ],
    );
  }
}
