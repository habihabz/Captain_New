import { Component, ElementRef, OnInit } from '@angular/core';
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
import { Address } from '../../../models/address.model';
import { IAddressService } from '../../../services/iaddress.service';
import { HttpClient } from '@angular/common/http';
declare var Razorpay: any;


@Component({
  selector: 'app-mycart',
  templateUrl: './mycart.component.html',
  styleUrl: './mycart.component.css'
})
export class MycartComponent implements OnInit {
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
  deliveryCharge: number = 35;
  netAmount: number = 0;
  discount: number = 0
  addresses: Address[] = [];
  address: Address = new Address();
  showAddressForm: boolean = false;

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
    private http: HttpClient

  ) {

    this.currentUser = iuser.getCurrentUser();
    this.country = this.geolocationService.getCurrentCountry();

  }
  ngOnInit(): void {
    this.getCarts();
    this.getMyAddress();
  }


  getAttachementOfaProduct(p_attachements: string) {
    var att: any;
    if (p_attachements) {
      att = JSON.parse(p_attachements);
    }
    return att;
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
      },
      (error: any) => {
      }
    );

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
      cartItem.c_price = cartItem.c_qty * cartItem.p_price;
    }
    this.getCartTotal();
  }

  decreaseQuantity(c_id: number): void {
    const cartItem = this.carts.find(c => c.c_id === c_id);
    if (cartItem && cartItem.c_qty > 1) {
      cartItem.c_qty--;
      cartItem.c_price = cartItem.c_qty * cartItem.p_price;
    }
    this.getCartTotal();
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
  const total = this.carts.reduce((sum, cart) => 
    sum + (cart.p_price * cart.c_qty), 0
  );

  this.totalPrice = total;
  this.discount = total * 0.1;
  this.netAmount = total + this.deliveryCharge - this.discount;
}

  placeOrder() {
    this.requestParms.user = this.currentUser.u_id;
    this.requestParms.details = JSON.stringify(this.carts);
    this.icustomerOrder.createOrUpdateCustomerOrder(this.requestParms).subscribe(
      (data: DbResult) => {
        if (data.message === 'Success') {
          this.carts = [];
          this.getCartTotal();
          this.snackbarService.showSuccess("Success");

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

  CreateOrUpdateAddress() {

    this.address.ad_cre_by = this.currentUser.u_id;
    if (this.address.ad_name!='' && this.address.ad_address != '' && this.address.ad_phone != '') {
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
    else
    {
      this.snackbarService.showError("Please Enter All Data");
    }

  }

  onShowAddressForm(){
    this.showAddressForm = !this.showAddressForm
    this.address=new Address();
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


  loadRazorpay() {
    return new Promise((resolve, reject) => {
      if (this.razorpayLoaded) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve(true);
      };
      script.onerror = () => reject(false);
      document.body.appendChild(script);
    });
  }

  async pay() {
    await this.loadRazorpay();

    const Razorpay = (window as any).Razorpay;

    this.http.post<any>(this.paymentUrl, { amount: this.netAmount})
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
            this.placeOrder() ;
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
}
