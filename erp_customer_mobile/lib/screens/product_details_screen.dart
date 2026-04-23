import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../models/product.dart';
import '../models/cart.dart';
import '../models/product_review.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';
import '../providers/favourite_provider.dart';
import '../providers/product_provider.dart';
import '../services/product_service.dart';
import '../services/product_review_service.dart';
import '../utils/constants.dart';

class ProductDetailsScreen extends StatefulWidget {
  final Product product;

  const ProductDetailsScreen({super.key, required this.product});

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  late Product _currentProduct;
  int _quantity = 1;
  ProductColor? _selectedColor;
  ProductSize? _selectedSize;
  List<String> _currentImages = [];
  List<ProductReview> _reviews = [];
  final bool _isLoadingImages = false;
  bool _isRefreshingProduct = false;
  bool _isLoadingReviews = false;
  
  final ProductService _productService = ProductService();
  final ProductReviewService _reviewService = ProductReviewService();
  final PageController _pageController = PageController();
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _reviewsKey = GlobalKey();

  @override
  void dispose() {
    _pageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _currentProduct = widget.product;
    _currentImages = _currentProduct.imageList;
    
    _refreshProductData(); 
    _fetchReviews();

    if (_currentProduct.availableColors.isNotEmpty) {
      _selectedColor = _currentProduct.availableColors.first;
      _updateImagesForColor(_selectedColor!.pc_id);
    }
    if (_currentProduct.availableSizes.isNotEmpty) {
      _selectedSize = _currentProduct.availableSizes.first;
    }
  }

  Future<void> _refreshProductData() async {
    setState(() => _isRefreshingProduct = true);
    final countryId = Provider.of<ProductProvider>(context, listen: false).selectedCountryId;
    final updatedProduct = await _productService.getProductByCountry(_currentProduct.p_id, countryId);
    if (updatedProduct != null && mounted) {
      setState(() {
        _currentProduct = updatedProduct;
        _isRefreshingProduct = false;
        if (_selectedColor != null) {
          _updateImagesForColor(_selectedColor!.pc_id);
        }
      });
    }
  }

  Future<void> _fetchReviews() async {
    setState(() => _isLoadingReviews = true);
    final reviews = await _reviewService.getProductReviews(_currentProduct.p_id);
    if (mounted) {
      setState(() {
        _reviews = reviews;
        _isLoadingReviews = false;
      });
    }
  }

  void _updateImagesForColor(int colorId) {
    final localImages = _currentProduct.getImagesForColor(colorId);
    setState(() {
      _currentImages = localImages;
      if (_pageController.hasClients) {
        _pageController.animateToPage(0, duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
      }
    });

    _loadColorImagesFromApi(colorId);
  }

  void _loadColorImagesFromApi(int colorId) async {
    final attachments = await _productService.getProductAttachmentsByColor(_currentProduct.p_id, colorId);
    if (mounted && attachments.isNotEmpty) {
      setState(() {
        _currentImages = attachments.map((a) => a.imagePath).toList();
      });
    }
  }

  void _scrollToReviews() {
    final context = _reviewsKey.currentContext;
    if (context != null) {
      Scrollable.ensureVisible(
        context,
        duration: const Duration(seconds: 1),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          SliverAppBar(
            expandedHeight: MediaQuery.of(context).size.height * 0.45,
            pinned: true,
            backgroundColor: Colors.white,
            elevation: 0,
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: CircleAvatar(
                backgroundColor: Colors.white.withOpacity(0.9),
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.black),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
            actions: [
              Consumer<FavouriteProvider>(
                builder: (context, favProvider, _) {
                  final auth = Provider.of<AuthProvider>(context, listen: false);
                  final isFav = favProvider.isFavourite(_currentProduct.p_id);
                  return Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: CircleAvatar(
                      backgroundColor: Colors.white.withOpacity(0.9),
                      child: IconButton(
                        icon: Icon(
                          isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded, 
                          color: Colors.redAccent
                        ),
                        onPressed: () {
                          if (!auth.isAuthenticated) {
                            Navigator.pushNamed(context, '/login');
                            return;
                          }
                          favProvider.toggleFavourite(_currentProduct.p_id, auth.customer!.u_id, auth.customer!.u_name);
                        },
                      ),
                    ),
                  );
                },
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                color: Colors.white, 
                padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 20),
                child: Stack(
                  children: [
                    _isLoadingImages 
                        ? const Center(child: CircularProgressIndicator())
                        : PageView.builder(
                            controller: _pageController,
                            itemCount: _currentImages.length,
                            itemBuilder: (context, index) {
                              final imageUrl = '${AppConstants.baseUrl}/${_currentImages[index]}';
                              return Hero(
                                tag: 'product-${_currentProduct.p_id}',
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                                  child: CachedNetworkImage(
                                    imageUrl: imageUrl,
                                    fit: BoxFit.contain, 
                                    placeholder: (context, url) => const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                                    errorWidget: (context, url, error) => const Icon(Icons.image_not_supported, size: 50),
                                  ),
                                ),
                              );
                            },
                          ),
                    if (_currentImages.length > 1)
                      Positioned(
                        bottom: 30,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(_currentImages.length, (index) => Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.black.withOpacity(0.2)),
                          )),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(30),
                  topRight: Radius.circular(30),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _currentProduct.p_name,
                              style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                              if (_currentProduct.p_overall_rating > 0) ...[
                                const SizedBox(height: 6),
                                GestureDetector(
                                  onTap: _scrollToReviews,
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.amber[50], 
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Row(
                                          children: [
                                            Icon(Icons.star_rounded, size: 14, color: Colors.amber[700]),
                                            const SizedBox(width: 4),
                                            Text(
                                              _currentProduct.p_overall_rating.toStringAsFixed(1),
                                              style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.amber[900]),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        '(${_reviews.length} reviews)',
                                        style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[400]),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            const SizedBox(height: 4),
                            Text(
                              _currentProduct.p_category_name,
                              style: GoogleFonts.inter(fontSize: 14, color: Colors.grey[500], fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                             _isRefreshingProduct ? '...' : '₹${_currentProduct.p_price.toStringAsFixed(2)}',
                            style: GoogleFonts.outfit(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: AppConstants.primaryColor,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 30),
                  
                  // Color Selection
                  if (_currentProduct.availableColors.isNotEmpty) ...[
                    Row(
                      children: [
                        Text('Select Color', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 8),
                        Text(
                          _selectedColor?.pc_name ?? '',
                          style: GoogleFonts.inter(fontSize: 14, color: Colors.grey[600], fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 50,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: _currentProduct.availableColors.length,
                        itemBuilder: (context, index) {
                          final color = _currentProduct.availableColors[index];
                          final isSelected = _selectedColor?.pc_id == color.pc_id;
                          // Check both code and name for the color value
                          var colorObj = _parseColor(color.pc_code);
                          if (colorObj == Colors.grey[300]!) {
                            colorObj = _parseColor(color.pc_name);
                          }
                          
                          return GestureDetector(
                            onTap: () {
                              setState(() => _selectedColor = color);
                              _updateImagesForColor(color.pc_id);
                            },
                            child: Container(
                              margin: const EdgeInsets.only(right: 12),
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: colorObj,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isSelected 
                                      ? AppConstants.primaryColor 
                                      : (colorObj == Colors.white || colorObj.computeLuminance() > 0.9 
                                          ? Colors.grey[300]! 
                                          : Colors.transparent),
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.08), 
                                    blurRadius: 4, 
                                    offset: const Offset(0, 2)
                                  )
                                ],
                              ),
                              child: isSelected 
                                  ? Center(
                                      child: Icon(
                                        Icons.check, 
                                        size: 20, 
                                        color: colorObj.computeLuminance() > 0.5 ? Colors.black : Colors.white
                                      )
                                    ) 
                                  : null,
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 25),
                  ],

                  // Size Selection
                  if (_currentProduct.availableSizes.isNotEmpty) ...[
                    Text('Select Size', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 12,
                      children: _currentProduct.availableSizes.map((size) {
                        final isSelected = _selectedSize?.ps_id == size.ps_id;
                        return ChoiceChip(
                          label: Text(size.ps_name),
                          selected: isSelected,
                          onSelected: (val) => setState(() => _selectedSize = size),
                          selectedColor: AppConstants.primaryColor.withOpacity(0.1),
                          labelStyle: GoogleFonts.inter(
                            color: isSelected ? AppConstants.primaryColor : Colors.black87,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            fontSize: 13,
                          ),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          side: BorderSide(color: isSelected ? AppConstants.primaryColor : Colors.grey[200]!),
                          elevation: 0,
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 25),
                  ],

                  Text('Description', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Text(
                    _currentProduct.p_description.isEmpty 
                        ? 'Premium quality gear designed for maximum performance and comfort during sports and training.' 
                        : _currentProduct.p_description,
                    style: GoogleFonts.inter(
                      fontSize: 13, 
                      height: 1.5, 
                      color: Colors.grey[700],
                      letterSpacing: 0.2
                    ),
                  ),
                  
                  const SizedBox(height: 30),
                  const Divider(),
                  const SizedBox(height: 30),

                  // Reviews Section
                  _buildReviewsSection(key: _reviewsKey),

                  const SizedBox(height: 140), 
                ],
              ),
            ),
          ),
        ],
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -10)),
          ],
        ),
        child: Row(
          children: [
             Container(
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  IconButton(icon: const Icon(Icons.remove, size: 20), onPressed: () => setState(() => _quantity > 1 ? _quantity-- : null)),
                  Text('$_quantity', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold)),
                  IconButton(icon: const Icon(Icons.add, size: 20), onPressed: () => setState(() => _quantity++)),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: SizedBox(
                height: 50,
                child: ElevatedButton(
                  onPressed: () => _addToCart(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppConstants.primaryColor,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Text(
                    'Add to Cart  •  ₹${(_currentProduct.p_price * _quantity).toStringAsFixed(0)}',
                    style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewsSection({Key? key}) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Reviews (${_reviews.length})', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold)),
            TextButton(
              onPressed: () => _showAddReviewDialog(),
              child: Text('Write a review', style: GoogleFonts.inter(color: AppConstants.primaryColor, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        if (_reviews.isEmpty && !_isLoadingReviews)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Text('No reviews yet. Be the first to review this product!', style: GoogleFonts.inter(color: Colors.grey[500])),
          ),
        
        if (_isLoadingReviews)
          const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())),

        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(vertical: 20),
          itemCount: _reviews.length,
          separatorBuilder: (context, index) => const SizedBox(height: 24),
          itemBuilder: (context, index) {
            final review = _reviews[index];
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: Colors.grey[100],
                      child: const Icon(Icons.person, size: 16, color: Colors.grey),
                    ),
                    const SizedBox(width: 10),
                    Text(review.pr_cre_by_name, style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13)),
                    const Spacer(),
                    Text(DateFormat('MMM dd, yyyy').format(review.pr_created_on), style: GoogleFonts.inter(color: Colors.grey[400], fontSize: 11)),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: List.generate(5, (i) => Icon(
                    Icons.star_rounded, 
                    size: 16, 
                    color: i < review.pr_overall_rating ? Colors.amber[600] : Colors.grey[200]
                  )),
                ),
                const SizedBox(height: 8),
                Text(review.pr_head_line, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(review.pr_review, style: GoogleFonts.inter(fontSize: 13, height: 1.5, color: Colors.black87)),
              ],
            );
          },
        ),
      ],
    );
  }

  void _showAddReviewDialog() {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (!auth.isAuthenticated) {
      Navigator.pushNamed(context, '/login');
      return;
    }

    int rating = 5;
    final headlineController = TextEditingController();
    final reviewController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(30))),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 24,
                right: 24,
                top: 30
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Write a Review', style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),
                  Text('How would you rate it?', style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
                  const SizedBox(height: 10),
                  Row(
                    children: List.generate(5, (i) => IconButton(
                      onPressed: () => setDialogState(() => rating = i + 1),
                      icon: Icon(Icons.star_rounded, size: 40, color: i < rating ? Colors.amber[600] : Colors.grey[200]),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    )),
                  ),
                  const SizedBox(height: 24),
                  TextField(
                    controller: headlineController,
                    decoration: InputDecoration(
                      labelText: 'Headline',
                      hintText: 'Sum up your experience',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: reviewController,
                    maxLines: 4,
                    decoration: InputDecoration(
                      labelText: 'Detailed Review',
                      hintText: 'What did you like or dislike?',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 30),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () async {
                        final review = ProductReview(
                          pr_prod_id: _currentProduct.p_id,
                          pr_overall_rating: rating,
                          pr_head_line: headlineController.text,
                          pr_review: reviewController.text,
                          pr_cre_by: auth.customer!.u_id,
                          pr_cre_by_name: auth.customer!.u_name,
                        );
                        final result = await _reviewService.submitReview(review);
                        if (mounted) {
                          Navigator.pop(context);
                          if (result.status) {
                            _fetchReviews();
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Thank you for your review!')));
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppConstants.primaryColor,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: Text('Submit Review', style: GoogleFonts.outfit(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            );
          }
        );
      },
    );
  }

  Color _parseColor(String colorStr) {
    if (colorStr.isEmpty) return Colors.grey[200]!;
    
    final cleanColor = colorStr.trim().toLowerCase();

    // Handle hex codes
    if (cleanColor.startsWith('#')) {
      try {
        return Color(int.parse(cleanColor.replaceFirst('#', '0xFF')));
      } catch (_) {
        return Colors.grey[300]!;
      }
    }

    // Comprehensive standard color mapping
    switch (cleanColor) {
      case 'white': return Colors.white;
      case 'black': return Colors.black;
      case 'red': return Colors.red;
      case 'blue': return Colors.blue;
      case 'green': return Colors.green;
      case 'yellow': return Colors.yellow;
      case 'orange': return Colors.orange;
      case 'grey': case 'gray': return Colors.grey;
      case 'pink': return Colors.pink;
      case 'purple': return Colors.purple;
      case 'amber': return Colors.amber;
      case 'brown': return Colors.brown;
      case 'cyan': return Colors.cyan;
      case 'indigo': return Colors.indigo;
      case 'lime': return Colors.lime;
      case 'teal': return Colors.teal;
      case 'gold': return const Color(0xFFFFD700);
      case 'silver': return const Color(0xFFC0C0C0);
      case 'navy': return const Color(0xFF000080);
      case 'olive': return const Color(0xFF808000);
      case 'maroon': return const Color(0xFF800000);
      case 'aqua': return const Color(0xFF00FFFF);
      case 'magenta': return const Color(0xFFFF00FF);
      case 'beige': return const Color(0xFFF5F5DC);
      case 'ivory': return const Color(0xFFFFFFF0);
      case 'khaki': return const Color(0xFFF0E68C);
      case 'coral': return const Color(0xFFFF7F50);
      case 'crimson': return const Color(0xFFDC143C);
      default: return Colors.grey[300]!;
    }
  }

  void _addToCart(BuildContext context) async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final cartProvider = Provider.of<CartProvider>(context, listen: false);
    final productProvider = Provider.of<ProductProvider>(context, listen: false);

    if (!auth.isAuthenticated) {
      Navigator.pushNamed(context, '/login');
      return;
    }

    // Ensure cart provider knows about the current country context
    cartProvider.setCountryId(productProvider.selectedCountryId);

    final cartItem = Cart(
      c_product: _currentProduct.p_id,
      c_qty: _quantity,
      c_cre_by: auth.customer!.u_id,
      c_price: _currentProduct.p_price * _quantity,
      c_country: productProvider.selectedCountryId,
      c_color: _selectedColor?.pc_id ?? 0,
      c_size: _selectedSize?.ps_id ?? 0,
      c_size_name: _selectedSize?.ps_name ?? '',
      c_color_name: _selectedColor?.pc_name ?? '',
    );

    final result = await cartProvider.addToCart(cartItem);
    if (!mounted) return;

    if (result.status) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Added to cart successfully!', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          backgroundColor: Colors.black87,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          duration: const Duration(seconds: 1),
        ),
      );
      
      // Navigate to cart
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
           Navigator.pushNamed(context, '/cart');
        }
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to add to cart: ${result.message}')),
      );
    }
  }
}
