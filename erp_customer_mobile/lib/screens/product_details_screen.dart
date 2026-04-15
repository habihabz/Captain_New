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
  bool _isLoadingImages = false;
  bool _isRefreshingProduct = false;
  bool _isLoadingReviews = false;
  
  final ProductService _productService = ProductService();
  final ProductReviewService _reviewService = ProductReviewService();
  final PageController _pageController = PageController();

  @override
  void initState() {
    super.initState();
    _currentProduct = widget.product;
    _currentImages = _currentProduct.imageList;
    
    _refreshProductData(); 
    _fetchReviews();

    if (_currentProduct.availableColors.isNotEmpty) {
      _selectedColor = _currentProduct.availableColors.first;
      _updateImagesForColor(_selectedColor!.id);
    }
    if (_currentProduct.availableSizes.isNotEmpty) {
      _selectedSize = _currentProduct.availableSizes.first;
    }
  }

  Future<void> _refreshProductData() async {
    setState(() => _isRefreshingProduct = true);
    final countryId = Provider.of<ProductProvider>(context, listen: false).selectedCountryId;
    final updatedProduct = await _productService.getProductByCountry(_currentProduct.id, countryId);
    if (updatedProduct != null && mounted) {
      setState(() {
        _currentProduct = updatedProduct;
        _isRefreshingProduct = false;
        if (_selectedColor != null) {
          _updateImagesForColor(_selectedColor!.id);
        }
      });
    }
  }

  Future<void> _fetchReviews() async {
    setState(() => _isLoadingReviews = true);
    final reviews = await _reviewService.getProductReviews(_currentProduct.id);
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
    final attachments = await _productService.getProductAttachmentsByColor(_currentProduct.id, colorId);
    if (mounted && attachments.isNotEmpty) {
      setState(() {
        _currentImages = attachments.map((a) => a.imagePath).toList();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
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
                  final isFav = favProvider.isFavourite(_currentProduct.id);
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
                          favProvider.toggleFavourite(_currentProduct.id, auth.customer!.id, auth.customer!.name);
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
                                tag: 'product-${_currentProduct.id}',
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
                              _currentProduct.name,
                              style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            if (_currentProduct.rating > 0) ...[
                              const SizedBox(height: 6),
                              Row(
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
                                          _currentProduct.rating.toStringAsFixed(1),
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
                            ],
                            const SizedBox(height: 4),
                            Text(
                              _currentProduct.categoryName,
                              style: GoogleFonts.inter(fontSize: 14, color: Colors.grey[500], fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                             _isRefreshingProduct ? '...' : '₹${_currentProduct.price.toStringAsFixed(2)}',
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
                          _selectedColor?.name ?? '',
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
                          final isSelected = _selectedColor?.id == color.id;
                          final colorObj = _parseColor(color.hex);
                          
                          return GestureDetector(
                            onTap: () {
                              setState(() => _selectedColor = color);
                              _updateImagesForColor(color.id);
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
                        final isSelected = _selectedSize?.id == size.id;
                        return ChoiceChip(
                          label: Text(size.name),
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
                    _currentProduct.description.isEmpty 
                        ? 'Premium quality gear designed for maximum performance and comfort during sports and training.' 
                        : _currentProduct.description,
                    style: GoogleFonts.inter(fontSize: 14, height: 1.6, color: Colors.grey[700]),
                  ),
                  
                  const SizedBox(height: 30),
                  const Divider(),
                  const SizedBox(height: 30),

                  // Reviews Section
                  _buildReviewsSection(),

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
                    'Add to Cart  •  ₹${(_currentProduct.price * _quantity).toStringAsFixed(0)}',
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

  Widget _buildReviewsSection() {
    return Column(
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
                    Text(review.createdByName, style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13)),
                    const Spacer(),
                    Text(DateFormat('MMM dd, yyyy').format(review.createdOn), style: GoogleFonts.inter(color: Colors.grey[400], fontSize: 11)),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: List.generate(5, (i) => Icon(
                    Icons.star_rounded, 
                    size: 16, 
                    color: i < review.rating ? Colors.amber[600] : Colors.grey[200]
                  )),
                ),
                const SizedBox(height: 8),
                Text(review.headline, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(review.review, style: GoogleFonts.inter(fontSize: 13, height: 1.5, color: Colors.black87)),
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
                          productId: _currentProduct.id,
                          rating: rating,
                          headline: headlineController.text,
                          review: reviewController.text,
                          createdBy: auth.customer!.id,
                          createdByName: auth.customer!.name,
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

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return Colors.grey;
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
      productId: _currentProduct.id,
      qty: _quantity,
      creBy: auth.customer!.id,
      price: _currentProduct.price,
      country: productProvider.selectedCountryId,
      color: _selectedColor?.id ?? 0,
      size: _selectedSize?.id ?? 0,
      sizeName: _selectedSize?.name ?? '',
      colorName: _selectedColor?.name ?? '',
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
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to add to cart: ${result.message}')),
      );
    }
  }
}
