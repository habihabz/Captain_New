import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { MasterData } from '../../../models/master.data.model';
import { Router } from '@angular/router';
import { SnackBarService } from '../../../services/isnackbar.service';
import { IProductService } from '../../../services/iproduct.service';
import { ICartService } from '../../../services/icart.service';
import { Cart } from '../../../models/cart.model';
import { User } from '../../../models/user.model';
import { IuserService } from '../../../services/iuser.service';
import { DbResult } from '../../../models/dbresult.model';
import { RequestParms } from '../../../models/requestParms';
import { GeolocationService } from '../../../services/GeoCurrentLocation.service';
import { ICustomerOrder } from '../../../services/icustomer.order.service';
import { Promocode } from '../../../models/promocode.model';
import { IPromocodeService } from '../../../services/ipromocode.service';
import { Address } from '../../../models/address.model';
import { IAddressService } from '../../../services/iaddress.service';
import { HttpClient } from '@angular/common/http';
import { ConstantValue } from '../../../models/constant.value.model';
import { IConstantValueService } from '../../../services/iconstant.values.service';
import { ProdAttachement } from '../../../models/prod.attachments.model';
declare var Razorpay: any;


@Component({
  selector: 'app-mycart',
  templateUrl: './mycart.component.html',
  styleUrl: './mycart.component.css'
})
export class MycartComponent implements OnInit, OnDestroy {
  apiUrl = `${environment.serverHostAddress}`;
  private paymentUrl = `${environment.serverHostAddress}/api/payment/create-order`;
  razorpayLoaded = false;
  country: MasterData = new MasterData();
  selectedImagePath: string = '';
  cart: Cart = new Cart();
  carts: Cart[] = [];
  currentUser: User = new User();
  quantity: number = 1;
  requestParms: RequestParms = new RequestParms();
  totalQty: number = 0;
  totalPrice: number = 0;
  deliveryCharge: number = 0;
  taxAmount: number = 0;
  netAmount: number = 0;
  discount: number = 0
  addresses: Address[] = [];
  address: Address = new Address();
  showAddressForm: boolean = false;
  showAllAddresses: boolean = false;
  constantValueList: ConstantValue[] = [];
  discountPercentConstant: ConstantValue = new ConstantValue();
  deliveryChargeConstant: ConstantValue = new ConstantValue();
  taxPercentConstant: ConstantValue = new ConstantValue();

  promoCode: string = '';
  appliedPromo: Promocode | null = null;
  promoDiscount: number = 0;
  applyingPromo: boolean = false;


  constructor(

    private router: Router,
    private elRef: ElementRef,
    private iproductService: IProductService,
    private snackbarService: SnackBarService,
    private icartService: ICartService,
    private iuser: IuserService,
    private icustomerOrder: ICustomerOrder,
    private iaddress: IAddressService,
    private geolocationService: GeolocationService,
    private iConstantValueService: IConstantValueService,
    private ipromocodeService: IPromocodeService,
    private http: HttpClient

  ) {

    this.currentUser = iuser.getCurrentUser();
    this.country = this.geolocationService.getCurrentCountry();

  }
  ngOnInit(): void {
    this.getConstantValues();
    this.getCarts();
    this.getMyAddress();
  }



  getConstantValues(): void {
    this.iConstantValueService.getConstantValues().subscribe(
      (data: ConstantValue[]) => {
        this.constantValueList = data;
        this.constantValueList.forEach((item) => {
          if (item.cv_name === 'Total Invoice Discount') {
            this.discountPercentConstant = item;
          } else if (item.cv_name === 'Delivery Charge') {
            this.deliveryChargeConstant = item;
            this.deliveryCharge = Number(this.deliveryChargeConstant.cv_value);
          } else if (item.cv_name === 'Tax Percentage') {
            this.taxPercentConstant = item;
          }
        });
      },
      (error: any) => {
        console.error('Error fetching constant value', error);

      }
    );
  }

  getAttachementOfaProduct(p_attachements: string) {
    if (p_attachements) {
      return JSON.parse(p_attachements);
    }
    return [];
  }

  getCartItemImage(cart: Cart): string {
    let attachments: any[] = [];
    try {
      attachments = this.getAttachementOfaProduct(cart.p_attachements);
    } catch {
      // If parsing fails, treat as a single path string
      if (cart.p_attachements && !cart.p_attachements.startsWith('[') && !cart.p_attachements.startsWith('{')) {
        return this.formatImageUrl(cart.p_attachements);
      }
    }

    if (!attachments || attachments.length === 0) return '';

    // 1. Try to find the exact color match (Force string comparison to be safe)
    const cartColor = String(cart.c_color || '').trim();
    const cartColorName = String(cart.c_color_name || '').toLowerCase().trim();
    
    let matchingImage = attachments.find((x: any) => String(x.pa_color || '').trim() === cartColor);
    
    // Fallback: match by name if ID didn't work and name exists
    if (!matchingImage && cartColorName) {
        matchingImage = attachments.find((x: any) => String(x.pa_color_name || x.pa_color || '').toLowerCase().trim() === cartColorName);
    }
    
    if (matchingImage) {
      return this.formatImageUrl(matchingImage.pa_image_path);
    }

    // 2. Fallback to shared assets (color 0 or empty)
    const sharedImage = attachments.find((x: any) => !x.pa_color || x.pa_color == 0 || String(x.pa_color).trim() === '0');
    if (sharedImage) {
      return this.formatImageUrl(sharedImage.pa_image_path);
    }

    // 3. Ultimate fallback: show the first available image
    return this.formatImageUrl(attachments[0].pa_image_path);
  }

  private formatImageUrl(path: string): string {
    if (!path) return '';
    
    // Clean the path of leading/trailing whitespace and redundant leading slashes
    let cleanPath = path.trim();
    while (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }

    // Now check if it's already a full URL
    if (cleanPath.startsWith('http')) return cleanPath;
    
    // Otherwise, append the API URL
    return `${this.apiUrl}/${cleanPath}`;
  }

  selectImage(index: number) {
    const selectedAttachment = this.getAttachementOfaProduct(this.cart.p_attachements)[index];
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

  getCarts() {
    this.requestParms = new RequestParms()
    this.requestParms.country = this.country.md_id;
    this.requestParms.user = this.currentUser.u_id;
    this.icartService.getCarts(this.requestParms).subscribe(
      (data: Cart[]) => {
        this.carts = data;
        this.getCartTotal();
        // Fetch specific images for each item correctly
        this.carts.forEach(cart => {
          this.resolveCartItemImage(cart);
        });
      },
      (error: any) => {
      }
    );
  }

  resolveCartItemImage(cart: any) {
    this.iproductService.getProductAttachementsByColor({
      id: cart.c_product,
      color: cart.c_color
    } as RequestParms).subscribe((attachments: any[]) => {
      if (attachments && attachments.length > 0) {
        // Find match or take first
        const image =
          attachments.find(x => String(x.pa_color).trim() === String(cart.c_color).trim())?.pa_image_path ||
          attachments[0]?.pa_image_path || '';
        
        cart.resolvedImageUrl = this.formatImageUrl(image);
      }
    });
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/single-product', productId]);
  }

  navigateTo(target: string): void {
    this.router.navigate(['/' + target]);
  }

  increaseQuantity(c_id: number): void {
    const cartItem = this.carts.find(c => c.c_id === c_id);
    if (cartItem) {
      cartItem.c_qty++;
      cartItem.c_price = Math.round(cartItem.c_qty * cartItem.p_price * 100) / 100;
    }
    this.updateCart(cartItem!);
  }

  decreaseQuantity(c_id: number): void {
    const cartItem = this.carts.find(c => c.c_id === c_id);
    if (cartItem && cartItem.c_qty > 1) {
      cartItem.c_qty--;
      cartItem.c_price = Math.round(cartItem.c_qty * cartItem.p_price * 100) / 100;
    }

    this.updateCart(cartItem!);

  }

  saveForLater(c_id: number): void {
    const cartItem = this.carts.find(c => c.c_id === c_id);
  }

  removeCart(c_id: number): void {
    const cartItem = this.carts.find(c => c.c_id === c_id);
    this.icartService.deleteCart(c_id).subscribe(
      (data: DbResult) => {
        if (data.message === 'Success') {
          this.carts = this.carts.filter(c => c.c_id != c_id);
          this.getCartTotal();
        } else {
          alert(data.message);
        }
      },
      (error: any) => {
      }
    );


  }

  getCartTotal() {
    this.totalQty = this.carts.reduce((s, c) => s + Number(c.c_qty), 0);

    // 1. Total Price (Inclusive of Tax)
    this.totalPrice = this.carts.reduce(
      (s, c) => s + (Number(c.p_price) * Number(c.c_qty)), 0
    );
    this.totalPrice = Math.round(this.totalPrice * 100) / 100;

    // 2. Fixed Discount removed - setting to 0 as per user request
    this.discount = 0;

    // 3. Taxable Amount (Equal to total price since fixed discount is removed)
    const netTaxableAmount = this.totalPrice;

    // 4. GST Extraction (Price is Inclusive of Tax)
    const taxPerc = Number(this.taxPercentConstant?.cv_value || 0);
    this.taxAmount = Math.round((netTaxableAmount * taxPerc / (100 + taxPerc)) * 100) / 100;

    // 5. Delivery
    this.deliveryCharge = Number(this.deliveryChargeConstant?.cv_value || 0);

    // 6. Promo Discount Calculation
    this.promoDiscount = 0;
    if (this.appliedPromo) {
      const minAmt = Number(this.appliedPromo.pc_min_order_amount || 0);
      if (this.totalPrice >= minAmt) {
        let pDisc = (this.totalPrice * Number(this.appliedPromo.pc_discount_perc)) / 100;
        const maxDisc = Number(this.appliedPromo.pc_max_discount_amount || 0);
        if (maxDisc > 0 && pDisc > maxDisc) {
          pDisc = maxDisc;
        }
        this.promoDiscount = Math.round(pDisc * 100) / 100;
      } else {
        this.snackbarService.showError(`Promo requires minimum order of ₹${minAmt}`);
        this.appliedPromo = null;
        this.promoCode = '';
      }
    }

    // 7. Net Amount (Total Price + Delivery - Promo Discount)
    this.netAmount = Math.round((this.totalPrice + this.deliveryCharge - this.promoDiscount) * 100) / 100;
  }

  applyPromoCode() {
    if (!this.promoCode) {
      this.snackbarService.showError("Please enter a promo code");
      return;
    }
    
    this.applyingPromo = true;
    
    // Simulate brief network delay for animation effect
    setTimeout(() => {
      this.ipromocodeService.validatePromocode(this.promoCode).subscribe({
        next: (res: DbResult) => {
          if (res.message === "Success") {
            this.ipromocodeService.getPromocodeByCode(this.promoCode).subscribe((pc: Promocode) => {
              const minAmt = Number(pc.pc_min_order_amount || 0);

              if (this.totalPrice < minAmt) {
                this.snackbarService.showError(`This promo requires a minimum order of ₹${minAmt}`);
                this.appliedPromo = null;
                this.applyingPromo = false;
                return;
              }

              this.appliedPromo = pc;
              this.getCartTotal();
              this.applyingPromo = false;
              this.snackbarService.showSuccess(`Promo "${pc.pc_code}" applied correctly!`);
            });
          } else {
            this.applyingPromo = false;
            this.snackbarService.showError(res.message);
          }
        },
        error: (err) => {
          this.applyingPromo = false;
          this.snackbarService.showError("Failed to validate promo code");
        }
      });
    }, 800); 
  }

  removePromo() {
    this.appliedPromo = null;
    this.promoCode = '';
    this.getCartTotal();
    this.snackbarService.showSuccess("Promo code removed");
  }

  placeOrder(paymentId: string = '') {
    const cartOnly = this.carts.map((c: any) => ({
      c_id: c.c_id,
      c_product: c.c_product,
      c_size: c.c_size,
      c_size_name: c.c_size_name,
      c_color: c.c_color,
      c_qty: c.c_qty,
      c_price: Math.round(c.c_price * 100) / 100
    }));

    this.requestParms.details = JSON.stringify(cartOnly);
    this.requestParms.user = this.currentUser.u_id;
    this.requestParms.others = this.appliedPromo ? this.appliedPromo.pc_code : '';
    this.requestParms.paymentId = paymentId; 
    this.requestParms.amount = this.promoDiscount; 

    this.icustomerOrder.createOrUpdateCustomerOrder(this.requestParms).subscribe(
      (data: DbResult) => {
        if (data.message === 'Success') {
          this.carts = [];
          this.getCartTotal();
          this.snackbarService.showSuccess("Success");
          this.router.navigate(['/payment-success']);

        } else {
          alert(data.message);
        }
      },
      (error: any) => {
      }
    );
  }

  getMyAddress() {
    this.requestParms.user = this.currentUser.u_id;
    this.iaddress.getMyAddresses(this.requestParms).subscribe(
      (data: Address[]) => {
        this.addresses = data;
      },
      (error: any) => {
      }
    );
  }

  get hasDefaultAddress(): boolean {
    return this.addresses.some(ad => ad.ad_is_default_yn?.toUpperCase() === 'Y');
  }

  get selectedAddress(): Address | null {
    if (this.addresses.length === 0) return null;
    return this.addresses.find(ad => ad.ad_is_default_yn?.toUpperCase() === 'Y') || this.addresses[0];
  }

  CreateOrUpdateAddress() {

    this.address.ad_cre_by = this.currentUser.u_id;
    if (this.address.ad_name != '' && this.address.ad_address != '' && this.address.ad_phone != '') {
      this.iaddress.createOrUpdateAddress(this.address).subscribe(
        (dbResult: DbResult) => {
          if (dbResult.message == 'Success') {

            this.snackbarService.showSuccess("Successfully Created");
            this.showAddressForm = false;
            this.getMyAddress();

          }
          else {
            this.snackbarService.showError(dbResult.message);
          }
        },
        (error: any) => {
        }
      );
    }
    else {
      this.snackbarService.showError("Please Enter All Data");
    }

  }

  onShowAddressForm() {
    this.showAddressForm = !this.showAddressForm
    this.address = new Address();
  }

  deleteAddress(ad_id: number) {
    this.iaddress.deleteAddress(ad_id).subscribe(
      (dbResult: DbResult) => {
        if (dbResult.message == 'Success') {
          this.snackbarService.showSuccess("Deleted");
          this.getMyAddress();

        }
        else {
          this.snackbarService.showError(dbResult.message);
        }
      },
      (error: any) => {
      }
    );

  }

  updateCart(cart: Cart) {
    this.icartService.createOrUpdateCart(cart).subscribe(
      (data: DbResult) => {
        if (data.message === 'Success') {
          this.snackbarService.showSuccess("Cart Updated");

        } else {
          this.snackbarService.showError("Failed to update cart");
        }
        this.getCartTotal();
      },
      (error: any) => {
      }
    );
  }

  loadRazorpay() {
    return new Promise((resolve, reject) => {
      // Check if scripts already exists in DOM
      const existing = document.querySelector('script[src*="razorpay"]');
      if (existing) {
        this.razorpayLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.id = 'razorpay-checkout-js';
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve(true);
      };
      script.onerror = () => reject(false);
      document.body.appendChild(script);
    });
  }

  cleanupRazorpay() {
    const scripts = document.querySelectorAll('script[src*="razorpay"]');
    scripts.forEach(s => s.remove());
    
    const iframes = document.querySelectorAll('iframe[src*="razorpay"]');
    iframes.forEach(i => i.remove());
    
    // Attempt to clear global reference
    if ((window as any).Razorpay) {
      delete (window as any).Razorpay;
    }
    
    this.razorpayLoaded = false;
  }

  ngOnDestroy() {
    this.cleanupRazorpay();
  }

  async pay() {
    await this.loadRazorpay();

    const Razorpay = (window as any).Razorpay;

    this.http.post<any>(this.paymentUrl, { amount: this.netAmount })
      .subscribe(order => {
        const options = {
          key: order.key,
          amount: order.amount * 100,
          currency: order.currency,
          name: 'Captain',
          description: 'Test Transaction',
          order_id: order.orderId,
          method: {
            upi: true
          },
          handler: (response: any) => {
            this.placeOrder(response.razorpay_payment_id);
          },
          prefill: {
            email: 'abimanjeri@gmail.com',
            contact: '9744764030'
          },
          theme: {
            color: '#3399cc'
          }
        };

        const rzp = new Razorpay(options);
        rzp.open();
      });
  }
  getProductAttachementsByColor(productId: number, colorId: number) {
    return this.iproductService.getProductAttachementsByColor({
      id: productId,
      color: colorId
    } as RequestParms);
  }
}
