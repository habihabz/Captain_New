import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Product } from '../../../models/product.model';
import { Router } from '@angular/router';
import { IProductService } from '../../../services/iproduct.service';
import { IMasterDataService } from '../../../services/imaster.data.service';
import { ICategoryService } from '../../../services/icategory.service';
import { Category } from '../../../models/category.model';
import { MasterData } from '../../../models/master.data.model';
import { RequestParms } from '../../../models/requestParms';
import { Subscription } from 'rxjs';
import { ProdAttachement } from '../../../models/prod.attachments.model';
import { environment } from '../../../../environments/environment';
import { GeolocationService } from '../../../services/GeoCurrentLocation.service';
import { ISliderService } from '../../../services/islider.service';
import { Slider } from '../../../models/slider.model';
import { Blog } from '../../../models/blog.model';
import { IBlogService } from '../../../services/iblog.service';
import { Favourite } from '../../../models/favourite.model';
import { IFavouriteService } from '../../../services/ifavourite.service';
import { User } from '../../../models/user.model';
import { DbResult } from '../../../models/dbresult.model';
import { SnackBarService } from '../../../services/isnackbar.service';
import { IuserService } from '../../../services/iuser.service';
import { IConstantValueService } from '../../../services/iconstant.values.service';
import { ConstantValue } from '../../../models/constant.value.model';

@Component({
  selector: 'app-web.home',
  templateUrl: './web.home.component.html',
  styleUrl: './web.home.component.css'
})
export class WebHomeComponent implements OnInit {
  @ViewChild('tabContainer') tabContainer!: ElementRef;
  
  scrollTabs(direction: number) {
    if (this.tabContainer) {
      this.tabContainer.nativeElement.scrollBy({ left: direction * 200, behavior: 'smooth' });
    }
  }

  apiUrl = `${environment.serverHostAddress}`;
  attachmentUrl = `${environment.serverHostAddress}`;
  country: MasterData = new MasterData();
  product: Product = new Product();
  products: Product[] = [];
  tempProducts: Product[] = [];
  favourite: Favourite = new Favourite();
  userFavourites: Favourite[] = [];
  isShopEnabled: boolean = false;
  requestParms: RequestParms = new RequestParms();
  subscription: Subscription = new Subscription();
  categories: Category[] = [];
  subcategories: MasterData[] = [];
  attachments: ProdAttachement[] = [];
  attachment: ProdAttachement = new ProdAttachement();
  sliders: Slider[] = [];
  blogs: Blog[] = [];
  latestBlog: Blog = new Blog();
  currentUser: User = new User();

  constructor(
    private elRef: ElementRef,
    private router: Router,
    private iproductService: IProductService,
    private imasterDataService: IMasterDataService,
    private icategoryService: ICategoryService,
    private geolocationService: GeolocationService,
    private ifavouriteService: IFavouriteService,
    private isliderService: ISliderService,
    private snackbarService: SnackBarService,
    private iblogService: IBlogService,
    private iuser: IuserService,
    private titleService: Title,
    private metaService: Meta,
    private constantService: IConstantValueService
  ) {
    this.currentUser = iuser.getCurrentUser();
    this.country = this.geolocationService.getCurrentCountry();
  }


  navigateTo(route: string) {
    this.router.navigate(['/' + route]);
  }

  ngOnInit(): void {
    this.setSEO();
    this.loadUserCountry();
    this.loadCategories();
    this.getSliders();
    this.checkShopStatus();
    this.getProductsByCountry();
    this.getBlogsForHomePage();
    this.getMasterDatasByType("SubCategory", (data) => { this.subcategories = data; });
    this.loadUserFavourites();
  }

  setSEO() {
    this.titleService.setTitle('Captain - Premium Sports Gear & Apparel');
    this.metaService.updateTag({ name: 'description', content: 'Discover premium sports equipment, football gear, and high-performance badminton accessories at Captain. Lead to Win with our expert-crafted products.' });
    this.metaService.updateTag({ property: 'og:title', content: 'Captain - Premium Sports Gear & Apparel' });
    this.metaService.updateTag({ property: 'og:description', content: 'Elevate your game with high-performance sports gear from Captain.' });
  }

  checkShopStatus() {
    this.constantService.getConstantValueByName('SHOP_ENABLED').subscribe({
      next: (res: ConstantValue) => {
        if (res && res.cv_name === 'SHOP_ENABLED') {
          this.isShopEnabled = res.cv_value?.toUpperCase() === 'TRUE';
        } else {
          this.isShopEnabled = true;
        }
      },
      error: () => {
        this.isShopEnabled = true;
      }
    });
  }

  getSliders() {
    this.isliderService.getSliders().subscribe(res => {
      this.sliders = res;
    });
  }

  getBlogsForHomePage(): void {
    this.iblogService.getBlogsForHomePage().subscribe(res => {
      this.blogs = res;
      this.latestBlog = this.blogs[0];
    });
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
  selectedCategoryId: number = 0;

  loadCategories(): void {
    this.icategoryService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data;
        if (this.categories && this.categories.length > 0) {
          this.selectedCategoryId = this.categories[0].ct_id;
        }
      },
      (error: any) => {

      }
    );
  }

  selectCategory(id: number) {
    this.selectedCategoryId = id;
  }

  touchStartX = 0;
  touchEndX = 0;

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  handleSwipe() {
    const swipeThreshold = 50;
    if (this.touchEndX < this.touchStartX - swipeThreshold) {
      this.nextCategory();
    } else if (this.touchEndX > this.touchStartX + swipeThreshold) {
      this.previousCategory();
    }
  }

  nextCategory() {
    if (!this.categories || this.categories.length === 0) return;
    const currentIndex = this.categories.findIndex(c => c.ct_id === this.selectedCategoryId);
    if (currentIndex < this.categories.length - 1) {
      this.selectCategory(this.categories[currentIndex + 1].ct_id);
      this.scrollTabs(1);
    }
  }

  previousCategory() {
    if (!this.categories || this.categories.length === 0) return;
    const currentIndex = this.categories.findIndex(c => c.ct_id === this.selectedCategoryId);
    if (currentIndex > 0) {
      this.selectCategory(this.categories[currentIndex - 1].ct_id);
      this.scrollTabs(-1);
    }
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
    this.tempProducts = this.products.filter(x => x.p_category == c_id || c_id == 0).slice(0, 8);
    return this.tempProducts;
  }
  getAttachementOfaProduct(p_attachements: string) {

    return JSON.parse(p_attachements);
  }
  navigateToProduct(productId: number) {
    this.router.navigate(['/single-product', productId]);
  }
  navigateToBlog(blogId: number): void {
    this.router.navigate(['/blog', blogId]);
  }
  async loadUserCountry() {
    try {
      this.geolocationService.getUserCountry();
    } catch (error) {

    }
  }

  loadUserFavourites() {
    if (this.currentUser && this.currentUser.u_id) {
      const params = new RequestParms();
      params.id = this.currentUser.u_id;
      this.ifavouriteService.getFavourites(params).subscribe(res => {
        this.userFavourites = res;
      });
    }
  }

  isFavourite(productId: number): boolean {
    return this.userFavourites.some(x => x.f_product == productId);
  }

  addToFavourites(productId: number) {
    if (!this.currentUser || !this.currentUser.u_id) {
      this.router.navigate(['/customer-login']);
      return;
    }

    const existingFav = this.userFavourites.find(x => x.f_product == productId);

    if (existingFav) {
      this.ifavouriteService.deleteFavourite(existingFav.f_id).subscribe((data: DbResult) => {
        if (data.message == "Success") {
          this.snackbarService.showSuccess("Removed from favourites");
          this.loadUserFavourites();
        }
      });
    } else {
      this.favourite = new Favourite();
      this.favourite.f_cre_by = this.currentUser.u_id;
      this.favourite.f_product = productId;

      this.ifavouriteService.createOrUpdateFavourite(this.favourite).subscribe(
        (data: DbResult) => {
          if (data.message == "Success") {
            this.snackbarService.showSuccess("Added to favourites");
            this.loadUserFavourites();
          }
          else {
            this.snackbarService.showError(data.message);
          }
        },
        (error: any) => {
        }
      );
    }
  }
}
