import { Component, ElementRef, OnInit } from '@angular/core';
import { CustomerOrder } from '../../../models/customer.order.model';
import { RequestParms } from '../../../models/requestParms';
import { ActivatedRoute, Router } from '@angular/router';
import { IProductService } from '../../../services/iproduct.service';
import { SnackBarService } from '../../../services/isnackbar.service';
import { IuserService } from '../../../services/iuser.service';
import { ICustomerOrder } from '../../../services/icustomer.order.service';
import { GeolocationService } from '../../../services/GeoCurrentLocation.service';
import { User } from '../../../models/user.model';
import { environment } from '../../../../environments/environment';
import { MasterData } from '../../../models/master.data.model';
import { OrderMovementHistory } from '../../../models/order.movement.history.model';
import { IOrderMovementHistoryService } from '../../../services/iorder.movement.history.service';
import { DbResult } from '../../../models/dbresult.model';
import { IReturnOrderService, ReturnOrder } from '../../../services/ireturn.order.service';

@Component({
  selector: 'app-order.details',
  templateUrl: './order.details.component.html',
  styleUrl: './order.details.component.css'
})
export class OrderDetailsComponent {
  apiUrl = `${environment.serverHostAddress}`;
  currentUser: User = new User();
  customerOrder: CustomerOrder = new CustomerOrder();
  orderId!: number;
  requestParms: RequestParms = new RequestParms();
  country: MasterData = new MasterData();
  orderMovementHistories: OrderMovementHistory[] = [];
  constructor(
    private router: Router,
    private elRef: ElementRef,
    private route: ActivatedRoute,
    private iproductService: IProductService,
    private snackBarService: SnackBarService,
    private iuser: IuserService,
    private icustomerOrder: ICustomerOrder,
    private geolocationService: GeolocationService,
    private iOrderMovementHistoryService: IOrderMovementHistoryService,
    private ireturnOrder: IReturnOrderService
  ) {
    this.currentUser = this.iuser.getCurrentUser();
  }
  ngOnInit(): void {
    this.country = this.geolocationService.getCurrentCountry();
    this.orderId = +this.route.snapshot.paramMap.get('id')!;
    this.getOrderDetails();

  }
  getOrderDetails(): void {
    this.getOrderMovementHistory(this.orderId);
    this.icustomerOrder.getCustomerOrder(this.orderId).subscribe(
      (data: CustomerOrder) => {
        this.customerOrder = data;
      },
      (error) => {

      }
    );
  }

  showReturnForm: boolean = false;
  returnReason: string = '';
  returnComments: string = '';
  bankName: string = '';
  accountNo: string = '';
  ifscCode: string = '';
  returnReasonsList: string[] = [
    'Product is damaged/defective',
    'Received the wrong item',
    'Doesn\'t match the description',
    'Quality is not as expected',
    'Changed my mind'
  ];

  isOrderCanceled(): boolean {
    if (this.customerOrder && (this.customerOrder.co_status_name === 'Canceled' || this.customerOrder.co_status_name === 'Returned')) {
      return true;
    }
    if (this.orderMovementHistories && this.orderMovementHistories.length > 0) {
      return this.orderMovementHistories.some(omh => (omh.omh_status_name === 'Canceled' || omh.omh_status_name === 'Returned') && omh.omh_cre_date);
    }
    return false;
  }

  isOrderReturned(): boolean {
    if (this.customerOrder && this.customerOrder.co_status_name === 'Returned') {
      return true;
    }
    if (this.orderMovementHistories && this.orderMovementHistories.length > 0) {
      return this.orderMovementHistories.some(omh => omh.omh_status_name === 'Returned' && omh.omh_cre_date);
    }
    return false;
  }

  isOrderDelivered(): boolean {
    if (this.customerOrder && this.customerOrder.co_status_name === 'Delivered') {
      return true;
    }
    if (this.orderMovementHistories && this.orderMovementHistories.length > 0) {
      return this.orderMovementHistories.some(omh => omh.omh_status_name === 'Delivered' && omh.omh_cre_date);
    }
    return false;
  }

  getAttachementOfaProduct(p_attachements: string) {
    if (p_attachements) {
      return JSON.parse(p_attachements);
    }
    return [];
  }

  getOrderItemImage(order: CustomerOrder): string {
    if (!order.p_attachements) return '';
    const attachments = this.getAttachementOfaProduct(order.p_attachements);
    if (!attachments || attachments.length === 0) return '';

    // 1. Try to find the exact color match
    const matchingImage = attachments.find((x: any) => x.pa_color == order.co_color);
    if (matchingImage) {
      return matchingImage.pa_image_path;
    }

    // 2. Fallback to shared assets (color 0)
    const sharedImage = attachments.find((x: any) => !x.pa_color || x.pa_color == 0);
    if (sharedImage) {
      return sharedImage.pa_image_path;
    }

    // 3. Ultimate fallback: show the first available image
    return attachments[0].pa_image_path;
  }
  downloadTaxInvoice() {

    this.icustomerOrder.invoice(this.orderId)
      .subscribe({

        next: (data: Blob) => {

          const blob = new Blob([data], { type: 'application/pdf' });

          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `Tax_Invoice_Order_${this.orderId}.pdf`;

          document.body.appendChild(a);
          a.click();

          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },

        error: () => {
          this.snackBarService.showError('Error downloading tax invoice.');
        }

      });
  }

  getOrderMovementHistory(co_id: number) {
    this.iOrderMovementHistoryService.getOrderMovementHistoriesByOrder(co_id).subscribe(
      (data: OrderMovementHistory[]) => {
        this.orderMovementHistories = data;
      },
      (error: any) => {
      }
    );
  }

  cancelCustomerOrder() {
    this.requestParms.id = this.orderId;
    this.requestParms.user = this.currentUser.u_id;
    if (confirm('Are you sure you want to cancel this order?')) {
      this.icustomerOrder.cancelCustomerOrder(this.requestParms).subscribe(
        (data: DbResult) => {
          if (data.message === "Success") {
            this.getOrderDetails();
            this.snackBarService.showSuccess('Order cancelled successfully.');
          } else {
            this.snackBarService.showError('Failed to cancel the order. Please try again.');
          }
        },
        (error: any) => {
          this.snackBarService.showError('Something went wrong. Please try again later.');
        }
      );
    }
  }

  returnCustomerOrder() {
    this.showReturnForm = !this.showReturnForm;
  }

  submitReturnRequest() {
    if (!this.returnReason || !this.bankName || !this.accountNo || !this.ifscCode) {
      this.snackBarService.showError('Please fill in all required return and bank details.');
      return;
    }

    const returnRequest: ReturnOrder = {
      ro_order_no: this.orderId,
      ro_reason: this.returnReason,
      ro_comments: this.returnComments,
      ro_bank_name: this.bankName,
      ro_account_no: this.accountNo,
      ro_ifsc_code: this.ifscCode,
      ro_cre_by: this.currentUser.u_id
    };

    if (confirm('Submit this return request with provided bank details?')) {
      this.ireturnOrder.raiseReturnRequest(returnRequest).subscribe(
        (data: DbResult) => {
          if (data.message === "Success") {
            this.getOrderDetails();
            this.showReturnForm = false;
            this.snackBarService.showSuccess('Return request submitted.');
          } else {
            this.snackBarService.showError('Failed to submit return request.');
          }
        },
        (error: any) => {
          this.snackBarService.showError('Something went wrong. Please try again later.');
        }
      );
    }
  }

  orderAgain() {
    if (this.customerOrder && this.customerOrder.co_product) {
       this.router.navigate(['/single-product', this.customerOrder.co_product]);
    }
  }
}
