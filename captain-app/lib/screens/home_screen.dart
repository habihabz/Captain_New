import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../providers/product_provider.dart';
import '../utils/constants.dart';
import '../widgets/product_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ProductProvider>(context, listen: false).fetchHomeData();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  int _calculateCrossAxisCount(BuildContext context) {
    double width = MediaQuery.of(context).size.width;
    if (width > 1400) return 6;
    if (width > 1100) return 5;
    if (width > 850) return 4;
    if (width > 550) return 3;
    return 2;
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final productProvider = Provider.of<ProductProvider>(context);

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF8F9FB),
      endDrawer: _buildFilterDrawer(productProvider),
      body: RefreshIndicator(
        onRefresh: () => productProvider.fetchHomeData(),
        child: CustomScrollView(
          slivers: [
            // Clean White Header
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.only(top: 40, left: 20, right: 20, bottom: 10),
                color: const Color(0xFFF8F9FB),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            GestureDetector(
                              onTap: () => Navigator.pushNamed(context, '/profile'),
                              child: CircleAvatar(
                                radius: 22,
                                backgroundColor: AppConstants.primaryColor.withValues(alpha: 0.1),
                                child: const Icon(Icons.person, color: AppConstants.primaryColor, size: 20),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Welcome back,',
                                  style: GoogleFonts.inter(color: Colors.grey[500], fontSize: 13, fontWeight: FontWeight.w500),
                                ),
                                Text(
                                  auth.customer?.u_name ?? 'Guest User',
                                  style: GoogleFonts.outfit(color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.logout_rounded, color: Colors.grey),
                          onPressed: () {
                            auth.logout();
                            Navigator.pushReplacementNamed(context, '/login');
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Find the Best Gear for Your Game',
                      style: GoogleFonts.outfit(
                        color: Colors.black,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        height: 1.1,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 15),
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.grey[100],
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: TextField(
                              controller: _searchController,
                              onChanged: (val) => productProvider.setSearchQuery(val),
                              decoration: InputDecoration(
                                hintText: 'Search products...',
                                hintStyle: GoogleFonts.inter(color: Colors.grey[400], fontSize: 14),
                                prefixIcon: const Icon(Icons.search, color: Colors.grey, size: 20),
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(vertical: 15),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        GestureDetector(
                          onTap: () => _scaffoldKey.currentState?.openEndDrawer(),
                          child: Container(
                            height: 52,
                            width: 52,
                            decoration: BoxDecoration(
                              color: AppConstants.primaryColor,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Icon(Icons.tune_rounded, color: Colors.white, size: 22),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Categories
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(top: 10, bottom: 20),
                child: SizedBox(
                  height: 50,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: productProvider.categories.length + 1,
                    itemBuilder: (context, index) {
                      final catId = index == 0 ? 0 : productProvider.categories[index - 1].ct_id;
                      final isSelected = productProvider.selectedCategoryId == catId;
                      final label = index == 0 ? 'All' : productProvider.categories[index - 1].ct_name;
                      
                      return Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: ChoiceChip(
                          label: Text(label),
                          selected: isSelected,
                          onSelected: (val) => productProvider.setCategory(catId),
                          selectedColor: AppConstants.primaryColor,
                          backgroundColor: Colors.grey[100],
                          labelStyle: GoogleFonts.inter(
                            color: isSelected ? Colors.white : Colors.black87,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            fontSize: 13,
                          ),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          side: BorderSide.none,
                          elevation: 0,
                          pressElevation: 0,
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),

            // Products Grid
            productProvider.isLoading 
              ? const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
              : productProvider.products.isEmpty
                ? SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.inventory_2_outlined, size: 50, color: Colors.grey[300]),
                          const SizedBox(height: 16),
                          Text('No products found', style: GoogleFonts.inter(color: Colors.grey[400])),
                        ],
                      ),
                    ),
                  )
                : SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
                    sliver: SliverGrid(
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: _calculateCrossAxisCount(context),
                        childAspectRatio: 0.75,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => ProductCard(product: productProvider.products[index]),
                        childCount: productProvider.products.length,
                      ),
                    ),
                  ),
            
            const SliverToBoxAdapter(child: SizedBox(height: 120)),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNav(context),
    );
  }

  Widget _buildFilterDrawer(ProductProvider provider) {
    return Drawer(
      width: MediaQuery.of(context).size.width * 0.85,
      backgroundColor: Colors.white,
      child: Column(
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(color: Colors.white),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Filters', style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold)),
                TextButton(
                  onPressed: () => provider.clearFilters(),
                  child: Text('Reset', style: GoogleFonts.inter(color: Colors.red)),
                )
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                _buildFilterSection('Subcategory', provider.subcategories, provider.selectedSubCategoryIds, (id) => provider.toggleSubCategory(id)),
                const Divider(height: 40),
                _buildFilterSection('Division', provider.divisions, provider.selectedDivisionIds, (id) => provider.toggleDivision(id)),
                const Divider(height: 40),
                _buildFilterSection('Size', provider.sizes, provider.selectedSizeIds, (id) => provider.toggleSize(id)),
                const SizedBox(height: 40),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Text('Apply Filters', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildFilterSection(String title, List<dynamic> items, List<int> selectedItems, Function(int) onToggle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 15),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: items.map((item) {
            final isSelected = selectedItems.contains(item.md_id);
            return GestureDetector(
              onTap: () => onToggle(item.md_id),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected ? AppConstants.primaryColor : Colors.grey[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isSelected ? AppConstants.primaryColor : Colors.grey[200]!),
                ),
                child: Text(
                  item.md_name,
                  style: GoogleFonts.inter(
                    color: isSelected ? Colors.white : Colors.black87,
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(12),
      height: 70,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 20, offset: const Offset(0, 10)),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _navItem(Icons.home_rounded, true),
          GestureDetector(onTap: () => Navigator.pushNamed(context, '/cart'), child: _navItem(Icons.shopping_bag_rounded, false)),
          GestureDetector(onTap: () => Navigator.pushNamed(context, '/profile'), child: _navItem(Icons.person_rounded, false)),
        ],
      ),
    );
  }

  Widget _navItem(IconData icon, bool isActive) {
    return Icon(icon, color: isActive ? AppConstants.primaryColor : Colors.grey[300], size: 28);
  }
}
