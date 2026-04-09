import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IProductService } from '../../../services/iproduct.service';
import { Product } from '../../../models/product.model';
import { environment } from '../../../../environments/environment';
import { ProductReview } from '../../../models/product.review.model';
import { IProductReviewService } from '../../../services/iproduct.review.service';
import { DbResult } from '../../../models/dbresult.model';
import { SnackBarService } from '../../../services/isnackbar.service';
import { RequestParms } from '../../../models/requestParms';
import { GeolocationService } from '../../../services/GeoCurrentLocation.service';
import { MasterData } from '../../../models/master.data.model';
import { ICartService } from '../../../services/icart.service';
import { Cart } from '../../../models/cart.model';
import { Customer } from '../../../models/customer.model';
import { ICustomerService } from '../../../services/icustomer.service';
import { IuserService } from '../../../services/iuser.service';
import { User } from '../../../models/user.model';
import { Favourite } from '../../../models/favourite.model';
import { IFavouriteService } from '../../../services/ifavourite.service';
import { ProdAttachement } from '../../../models/prod.attachments.model';
declare var $: any;

@Component({
  selector: 'app-single-product',
  templateUrl: './single-product.component.html',
  styleUrl: './single-product.component.css'
})
export class SingleProductComponent implements OnInit {
  apiUrl = `${environment.serverHostAddress}`;
  country: MasterData = new MasterData();
  productId!: number;
  product: Product = new Product();
  selectedImagePath: string = '';
  selectedSize: number = 0;
  selectedColor: number = 0;
  productReview: ProductReview = new ProductReview();
  productReviews: ProductReview[] = [];
  productsMayLike: Product[] = [];
  filteredReviews: any[] = [];
  selectedRating: number = 0;
  selectedDate: number = 0;
  isCreateDivVisible = false;
  requestParms: RequestParms = new RequestParms();
  cart: Cart = new Cart();
  currentUser: User = new User();
  favourite: Favourite = new Favourite();
  productAttachements: any[] = [];

  // IMAGE ZOOM VARIABLES
  isZoomed: boolean = false;
  transformOrigin: string = 'center center';

  onMouseMove(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Slight boundary clamping so it doesn't zoom too far on the edges
    const clampX = Math.max(0, Math.min(100, x));
    const clampY = Math.max(0, Math.min(100, y));

    this.transformOrigin = `${clampX}% ${clampY}%`;
    this.isZoomed = true;
  }

  onMouseLeave() {
    this.isZoomed = false;
    this.transformOrigin = 'center center';
  }

  constructor(
    private router: Router,
    private elRef: ElementRef,
    private route: ActivatedRoute,
    private iproductService: IProductService,
    private snackbarService: SnackBarService,
    private icartService: ICartService,
    private ifavouriteService: IFavouriteService,
    private iproductReviewService: IProductReviewService,
    private geolocationService: GeolocationService,
    private iuser: IuserService
  ) {

    this.currentUser = iuser.getCurrentUser();
  }
  ngOnInit(): void {
    this.country = this.geolocationService.getCurrentCountry();
    this.productId = +this.route.snapshot.paramMap.get('id')!;

    this.getProductByCountry(this.productId);
    this.getProductsMayLike(this.productId);
    this.getProductReviews(this.productId);
  }
  getProductByCountry(productId: number) {
    this.productAttachements= [];
    this.requestParms.id = productId;
    this.requestParms.country = this.country.md_id;
    this.iproductService.getProductByCountry(this.requestParms).subscribe(
      (data: Product) => {
        this.product = data;
        // Set default color and size
        const colors = this.getListFromJSON(this.product.p_colors);
        if (colors && colors.length > 0) {
          this.selectedColor = colors[0].pc_color;
        }

        const sizes = this.getListFromJSON(this.product.p_sizes);
        if (sizes && sizes.length > 0) {
          this.selectedSize = sizes[0].ps_size;
        }

        // Set initial image preview based on the selected color
        const attachments = this.getAttachementOfaProduct(this.product.p_attachements);
        if (attachments && attachments.length > 0) {
          // Try to find the first image for the default color
          const firstColorImage = attachments.find((x: any) => x.pa_color == this.selectedColor);
          if (firstColorImage) {
            this.selectedImagePath = this.apiUrl + '/' + firstColorImage.pa_image_path;
          } else {
            // Fallback to first image if no color-specific image exists
            this.selectedImagePath = this.apiUrl + '/' + attachments[0].pa_image_path;
          }
        }
         this.getProductAttachementsByColor();
      },
      (error: any) => {
      }
    );
  }

  getAttachementOfaProduct(p_attachements: string) {
    if (p_attachements) {
      return JSON.parse(p_attachements);
    }
    return [];
  }

  getFilteredAttachments() {
    const attachments = this.getAttachementOfaProduct(this.product.p_attachements);
    if (!attachments || attachments.length === 0) return [];

    // 1. Try to get images specifically for this selected color
    const specificMatches = attachments.filter((x: any) => x.pa_color == this.selectedColor && x.pa_color != 0);

    if (specificMatches.length > 0) {
      // If we have color-specific images, only show those + any shared/general photos (color 0)
      return attachments.filter((x: any) => (x.pa_color == this.selectedColor) || (!x.pa_color || x.pa_color == 0));
    }

    // 2. If NO color-specific images exist, show only General/Shared images (color 0)
    // This allows you to see the shoes if they were uploaded without a specific color tag, 
    // but hides images explicitly tagged as "Red" when you pick "Yellow".
    const sharedMatches = attachments.filter((x: any) => !x.pa_color || x.pa_color == 0);
    if (sharedMatches.length > 0) {
      return sharedMatches;
    }

    // 3. Ultimate fallback: if there's no color logic at all, show everything
    return attachments;
  }

  selectImage(index: number) {
    const selectedAttachment = this.getFilteredAttachments()[index];
    if (selectedAttachment) {
      this.selectedImagePath = this.apiUrl + '/' + selectedAttachment.pa_image_path;
    }
  }

  getListFromJSON(jsonStr: string) {
    if (jsonStr) {
      return JSON.parse(jsonStr);
    }
    else {
      return null;
    }
  }
  selectSize(size: number) {
    this.selectedSize = size;
  }
  selectColor(color: number) {
    this.selectedColor = color;
    this.productAttachements = [];
    this.getProductAttachementsByColor();
  }

  getProductAttachementsByColor() {
    this.iproductService.getProductAttachementsByColor({ id: this.product.p_id, color: this.selectedColor } as RequestParms).subscribe(
      (data: ProdAttachement[]) => {
        if (data && data.length > 0) {
          this.selectedImagePath = this.apiUrl + '/' + data[0].pa_image_path;
          this.product.p_attachements = JSON.stringify(data);
          this.productAttachements = data;
        }
      },
      (error: any) => {
      }
    );
  }

  getProductsMayLike(productId: number) {
    this.iproductService.getProductsByCountry(this.country.md_id).subscribe(
      (data: Product[]) => {
        this.productsMayLike = data.filter(x => x.p_id != productId).slice(0, 4);
      },
      (error: any) => {
      }
    );
  }
  navigateToProduct(productId: number): void {
    this.router.navigate(['/single-product', productId]);
    this.getProductByCountry(productId);
    this.getProductsMayLike(productId);
    this.getProductReviews(productId);

  }
  toggleCreateDiv() {
    this.isCreateDivVisible = !this.isCreateDivVisible;
  }
  createOeUpdateProductReview() {
    this.productReview.pr_prod_id = this.product.p_id;
    this.iproductReviewService.createOrUpdateProductReview(this.productReview).subscribe(
      (data: DbResult) => {
        if (data.message == "Success") {
          this.snackbarService.showSuccess("Thanks For your Valuable Feedbacks");
          this.isCreateDivVisible = false;
          this.getProductReviews(this.product.p_id);
          this.productReview = new ProductReview();
        }
        else {
          this.snackbarService.showSuccess(data.message);
        }
      },
      (error: any) => {
      }
    );

  }
  getProductReviews(prod_id: number) {
    this.iproductReviewService.getProductReviews(prod_id).subscribe(
      (data: ProductReview[]) => {
        this.productReviews = data;
        this.applyFilters();
      },
      (error: any) => {
      }
    );
  }
  applyFilters(): void {
    const today = new Date();
    this.filteredReviews = this.productReviews.filter(review => {
      const reviewDate = new Date(review.pr_created_on);
      const dayDifference = Math.floor((today.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const matchesRating = this.selectedRating == 0 || review.pr_overall_rating == this.selectedRating;
      const matchesDate = this.selectedDate == 0 || dayDifference <= this.selectedDate;
      
      return matchesRating && matchesDate;
    });
  }


  setRating(rating: number): void {
    this.productReview.pr_overall_rating = rating;
  }

  addToCart() {
    const hasSizes = this.getListFromJSON(this.product.p_sizes)?.length > 0;
    const hasColors = this.getListFromJSON(this.product.p_colors)?.length > 0;

    if (hasSizes && this.selectedSize == 0) {
      this.snackbarService.showError("Please Choose Size");
      return;
    }
    if (hasColors && this.selectedColor == 0) {
      this.snackbarService.showError("Please Choose Color");
      return;
    }

    this.cart.c_size = this.selectedSize;
    this.cart.c_color = this.selectedColor;

    // Resolve names for the cart display
    const sizes = this.getListFromJSON(this.product.p_sizes);
    const sizeMatch = sizes?.find((s: any) => s.ps_size == this.selectedSize);
    this.cart.c_size_name = sizeMatch ? sizeMatch.ps_size_name : '';

    const colors = this.getListFromJSON(this.product.p_colors);
    const colorMatch = colors?.find((c: any) => c.pc_color == this.selectedColor);
    this.cart.c_color_name = colorMatch ? colorMatch.pc_color_name : '';

    this.cart.c_product = this.product.p_id;
    this.cart.c_qty = 1;
    this.cart.c_cre_by = this.currentUser.u_id;
    this.icartService.createOrUpdateCart(this.cart).subscribe(
      (data: DbResult) => {
        this.router.navigate(['my-cart']);
      },
      (error: any) => {
      }
    );
  }

  addToFavourites(productId: number) {

    if (productId && this.currentUser && this.currentUser.u_id) {
      this.favourite.f_cre_by = this.currentUser.u_id;
      this.favourite.f_product = productId;

      this.ifavouriteService.createOrUpdateFavourite(this.favourite).subscribe(
        (data: DbResult) => {
          if (data.message == "Success") {
            this.snackbarService.showSuccess("Added to favourites");
            this.router.navigate(['/favourites']);
          }
          else {
            this.snackbarService.showError(data.message);
          }
        },
        (error: any) => {
        }
      );

    } else {
      this.router.navigate(['/login']);
    }

  }

}
