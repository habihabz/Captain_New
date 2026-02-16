import { Component, ElementRef, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
import { MasterData } from '../../../models/master.data.model';
import { RequestParms } from '../../../models/requestParms';
import { ProdAttachement } from '../../../models/prod.attachments.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { IProductService } from '../../../services/iproduct.service';
import { IMasterDataService } from '../../../services/imaster.data.service';
import { ICategoryService } from '../../../services/icategory.service';
import { ProdSize } from '../../../models/prod.size.model';
import { ProductSearchParms } from '../../../models/product.search.parms.model';
import { GeolocationService } from '../../../services/GeoCurrentLocation.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  apiUrl = `${environment.serverHostAddress}`;
  product: Product = new Product();
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategoryIds: number[] = [];
  subcategories: MasterData[] = [];
  selectedSubCategoryIds: number[] = [];
  sizes: MasterData[] = [];
  selectedSizeIds: number[] = [];
  requestParms: RequestParms = new RequestParms();
  subscription: Subscription = new Subscription();
  attachments: ProdAttachement[] = [];
  attachment: ProdAttachement = new ProdAttachement();
  selectedCategory: number = 1;
  selectedSize: MasterData = new MasterData();
  openSection: string | null = null;
  sortBy: number = 0;
  productSearchParms:ProductSearchParms=new ProductSearchParms();
  country:MasterData=new  MasterData();
  
  constructor(
    private elRef: ElementRef,
    private router: Router,
    private iproductService: IProductService,
    private imasterDataService: IMasterDataService,
    private icategoryService: ICategoryService,
    private geolocationService: GeolocationService,
  ) {

    this.country = this.geolocationService.getCurrentCountry();

  }

  ngOnInit(): void {
    this.loadCategories();
    this.getProductsByCountry();
    this.getMasterDatasByType("SubCategory", (data) => { this.subcategories = data; });
    this.getMasterDatasByType("ProductSize", (data) => { this.sizes = data; });

  }
  getProductsByCountry() {
    this.iproductService.getProductsByCountry(this.country.md_id).subscribe(
      (data: Product[]) => {
        this.products = data;
      },
      (error: any) => {
      }
    );
  }
  loadCategories(): void {
    this.icategoryService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data;
      },
      (error: any) => {

      }
    );
  }

  getMasterDatasByType(masterType: string, callback: (data: MasterData[]) => void): void {
    this.requestParms = new RequestParms();
    this.requestParms.type = masterType;
    this.imasterDataService.getMasterDatasByType(this.requestParms).subscribe(
      (data: MasterData[]) => {
        callback(data);  // Pass the data to the callback function
      },
      (error: any) => {

        callback([]);  // Pass an empty array if there's an error
      }
    );
  }
  getProductsByCategory(c_id: number) {

    this.filteredProducts = this.products.filter(x => x.p_category == c_id);
    return this.filteredProducts;

  }
  getAttachementOfaProduct(p_attachements: string) {

    return JSON.parse(p_attachements);
  }
  navigateToProduct(productId: number) {

    this.router.navigate(['/single-product', productId]);

  }

  onCategoryChange(event: Event, categoryId: number): void {

    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedCategoryIds.push(categoryId);
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== categoryId);
    }
    this. getProductsByFilters();

  }

  onSubCategoryChange(event: Event, subCategoryId: number): void {

    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedSubCategoryIds.push(subCategoryId);
    } else {
      this.selectedSubCategoryIds = this.selectedSubCategoryIds.filter(id => id !== subCategoryId);
    }
    this. getProductsByFilters();

  }


  onSizeChange(event: Event, sizeId: number) {

    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedSizeIds.push(sizeId);
    } else {
      this.selectedSizeIds = this.selectedSizeIds.filter(id => id !== sizeId);
    }
    this. getProductsByFilters();

  }
  toggleSection(section: string) {

    this.openSection = this.openSection === section ? null : section;

  }

  getProductsByFilters(): void {
    
    this.productSearchParms.sizes=this.selectedSizeIds+'';
    this.productSearchParms.categories=this.selectedCategoryIds+'';
    this.productSearchParms.subcategories=this.selectedSubCategoryIds+'';
    this.productSearchParms.country=this.country.md_id;
    this.iproductService.getProductsByFilters(this.productSearchParms).subscribe(
      (data: Product[]) => {
        this.products = data;
      },
      (error: any) => {
      }
    );

  }
}
