import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/product.dart';
import '../providers/auth_provider.dart';
import '../providers/favourite_provider.dart';
import '../utils/constants.dart';
import '../screens/product_details_screen.dart';

class ProductCard extends StatelessWidget {
  final Product product;

  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final favProvider = Provider.of<FavouriteProvider>(context);
    final auth = Provider.of<AuthProvider>(context);
    final isFav = favProvider.isFavourite(product.p_id);

    final imageUrl = product.imageList.isNotEmpty 
        ? '${AppConstants.baseUrl}/${product.imageList[0]}' 
        : '';

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProductDetailsScreen(product: product),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 3, 
              child: Stack(
                children: [
                   ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    child: Hero(
                      tag: 'product-${product.p_id}',
                      child: imageUrl.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: imageUrl,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              placeholder: (context, url) => Container(color: Colors.grey[50]),
                              errorWidget: (context, url, error) => const Icon(Icons.error, size: 20),
                            )
                          : Container(color: Colors.grey[50], child: const Icon(Icons.image_not_supported, size: 20)),
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: () {
                        if (!auth.isAuthenticated) {
                          Navigator.pushNamed(context, '/login');
                          return;
                        }
                        favProvider.toggleFavourite(product.p_id, auth.customer!.u_id, auth.customer!.u_name);
                      },
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                        child: Icon(
                          isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded, 
                          size: 16, 
                          color: Colors.redAccent
                        ),
                      ),
                    ),
                  ),
                  if (product.p_overall_rating > 0)
                    Positioned(
                      bottom: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.9),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              product.p_overall_rating.toStringAsFixed(1),
                              style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.black),
                            ),
                            const SizedBox(width: 2),
                            const Icon(Icons.star_rounded, size: 10, color: Colors.amber),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(10.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.p_name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          product.p_category_name,
                          style: GoogleFonts.inter(color: Colors.grey[500], fontSize: 8),
                        ),
                        const SizedBox(height: 4),
                        if (product.availableColors.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 4.0),
                            child: Row(
                              children: [
                                ...product.availableColors.take(3).map((color) => Container(
                                  margin: const EdgeInsets.only(right: 3),
                                  width: 6,
                                  height: 6,
                                  decoration: BoxDecoration(
                                    color: _parseColor(color.pc_code),
                                    shape: BoxShape.circle,
                                  ),
                                )),
                                if (product.availableColors.length > 3)
                                  Text(' +${product.availableColors.length - 3}', style: const TextStyle(fontSize: 7, color: Colors.grey))
                              ],
                            ),
                          ),
                      ],
                    ),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '₹${product.p_price.toStringAsFixed(2)}',
                          style: GoogleFonts.outfit(
                            color: AppConstants.primaryColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(3),
                          decoration: const BoxDecoration(
                            color: AppConstants.primaryColor,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.add, color: Colors.white, size: 14),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return Colors.grey;
    }
  }
}
