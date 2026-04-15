import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../providers/favourite_provider.dart';
import '../utils/constants.dart';
import '../screens/product_details_screen.dart';

class FavouritesScreen extends StatefulWidget {
  const FavouritesScreen({super.key});

  @override
  State<FavouritesScreen> createState() => _FavouritesScreenState();
}

class _FavouritesScreenState extends State<FavouritesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.isAuthenticated) {
        Provider.of<FavouriteProvider>(context, listen: false).fetchFavourites(auth.customer!.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final favProvider = Provider.of<FavouriteProvider>(context);
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('My Favourites', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
      ),
      body: favProvider.isLoading && favProvider.favourites.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : favProvider.favourites.isEmpty
              ? _buildEmptyState()
              : _buildFavouritesList(favProvider, auth.customer!.id),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.favorite_outline_rounded, size: 80, color: Colors.grey[100]),
          const SizedBox(height: 16),
          Text(
            'No favourites yet',
            style: GoogleFonts.outfit(fontSize: 20, color: Colors.grey[400], fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Save items you love to find them later.',
            style: GoogleFonts.inter(color: Colors.grey[400], fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildFavouritesList(FavouriteProvider provider, int customerId) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      itemCount: provider.favourites.length,
      itemBuilder: (context, index) {
        final fav = provider.favourites[index];
        final product = fav.product;
        if (product == null) return const SizedBox.shrink();

        final imageUrl = product.imageList.isNotEmpty
            ? '${AppConstants.baseUrl}/${product.imageList[0]}'
            : '';

        return GestureDetector(
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => ProductDetailsScreen(product: product)),
          ),
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey[100]!),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: imageUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: imageUrl,
                          width: 80,
                          height: 80,
                          fit: BoxFit.contain,
                          placeholder: (context, url) => Container(color: Colors.grey[50]),
                        )
                      : Container(width: 80, height: 80, color: Colors.grey[50]),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.name,
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        product.categoryName,
                        style: GoogleFonts.inter(color: Colors.grey[400], fontSize: 12),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '₹${product.price.toStringAsFixed(2)}',
                        style: GoogleFonts.outfit(color: AppConstants.primaryColor, fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => provider.removeFavourite(fav.id, customerId),
                  icon: Icon(Icons.delete_outline_rounded, color: Colors.grey[400], size: 20),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
