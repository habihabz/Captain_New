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
  constructor(
    private router: Router,
    private elRef: ElementRef,
    private route: ActivatedRoute,
    private iproductService: IProductService,
    private snackbarService: SnackBarService,
    private icartService: ICartService,
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
    this.applyFilters();
  }
  getProductByCountry(productId: number) {
    this.requestParms.id = productId;
    this.requestParms.country = this.country.md_id;
    this.iproductService.getProductByCountry(this.requestParms).subscribe(
      (data: Product) => {
        this.product = data;
        this.selectedImagePath = this.apiUrl + '/' + this.getAttachementOfaProduct(this.product.p_attachements)[0].pa_image_path;
      },
      (error: any) => {
      }
    );
  }

  getAttachementOfaProduct(p_attachements: string) {
    var att: any;
    if (p_attachements) {
      att = JSON.parse(p_attachements);
    }
    return att;
  }
  selectImage(index: number) {
    const selectedAttachment = this.getAttachementOfaProduct(this.product.p_attachements)[index];
    this.selectedImagePath = this.apiUrl + '/' + selectedAttachment.pa_image_path;
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
  getProductsMayLike(productId: number) {
    this.iproductService.getProducts().subscribe(
      (data: Product[]) => {
        this.productsMayLike = data.filter(x => x.p_id != productId);
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
        this.filteredReviews = data;
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
      return ((review.pr_overall_rating == this.selectedRating) || this.selectedRating == 0) && (dayDifference <= this.selectedDate || dayDifference == 0);
    });
  }


  setRating(rating: number): void {
    this.productReview.pr_overall_rating = rating;
  }

  addToCart() {
    if (this.selectedSize != 0) {
      this.cart.c_size = this.selectedSize;
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
    else
    {
        this.snackbarService.showSuccess("Please Choose Size");
    }
  }
}
