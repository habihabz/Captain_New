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
  returnMovementHistories: OrderMovementHistory[] = [];
  isReturnActive: boolean = false;
  isRefundActive: boolean = false;

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

    this.icustomerOrder.getCustomerOrder(this.orderId).subscribe(
      (data: CustomerOrder) => {
        this.customerOrder = data;
        this.resolveOrderItemImage(this.customerOrder);
        this.getOrderMovementHistory(this.orderId);
      },
      (error) => {
      }
    );
  }

  showReturnForm: boolean = false;
  showCancelRefundForm: boolean = false;
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
    return !!(this.customerOrder && (this.customerOrder.co_is_canceled === 'Y' || this.customerOrder.co_status_name === 'Canceled'));
  }

  isOrderReturned(): boolean {
    return !!(this.customerOrder && (this.customerOrder.co_status_name === 'Returned' || this.isReturnActive));
  }

  isOrderDelivered(): boolean {
    return !!(this.customerOrder && this.customerOrder.co_status_name === 'Delivered');
  }

  getAttachementOfaProduct(p_attachements: string) {
    if (p_attachements) {
      return JSON.parse(p_attachements);
    }
    return [];
  }

  resolveOrderItemImage(order: any) {
    this.iproductService.getProductAttachementsByColor({
      id: order.co_product,
      color: order.co_color
    } as RequestParms).subscribe((attachments: any[]) => {
      if (attachments && attachments.length > 0) {
        const image =
          attachments.find(x => String(x.pa_color).trim() === String(order.co_color).trim())?.pa_image_path ||
          attachments[0]?.pa_image_path || '';
        
        order.resolvedImageUrl = this.formatImageUrl(image);
      } else {
        order.resolvedImageUrl = this.getOrderItemImage(order);
      }
    });
  }

  getOrderItemImage(order: CustomerOrder): string {
    const attachments = this.getAttachementOfaProduct(order.p_attachements);
    if (!attachments || attachments.length === 0) return '';
    const cartColor = String(order.co_color || '').trim();
    const cartColorName = String(order.co_color_name || '').toLowerCase().trim();
    let matchingImage = attachments.find((x: any) => String(x.pa_color || '').trim() === cartColor);
    if (!matchingImage && cartColorName) {
        matchingImage = attachments.find((x: any) => String(x.pa_color_name || x.pa_color || '').toLowerCase().trim() === cartColorName);
    }
    return this.formatImageUrl(matchingImage ? matchingImage.pa_image_path : attachments[0].pa_image_path);
  }

  private formatImageUrl(path: string): string {
    if (!path) return '';
    let cleanPath = path.trim();
    while (cleanPath.startsWith('/')) { cleanPath = cleanPath.substring(1); }
    if (cleanPath.startsWith('http')) return cleanPath;
    return `${this.apiUrl}/${cleanPath}`;
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

  allMovementHistories: any[] = [];

  getOrderMovementHistory(co_id: number) {
    this.iOrderMovementHistoryService.getOrderMovementHistoriesByOrder(co_id).subscribe(
      (data: OrderMovementHistory[]) => {
        this.allMovementHistories = data;
        
        // Split for conditional UI logic if needed elsewhere
        this.orderMovementHistories = data.filter(omh => omh.omh_workflow_id === 1);
        const returnAndRefund = data.filter(omh => omh.omh_workflow_id === 2 || omh.omh_workflow_id === 3);
        this.isReturnActive = data.some(omh => omh.omh_workflow_id === 2);
        this.isRefundActive = data.some(omh => omh.omh_workflow_id === 3) || this.isOrderCanceled();
      }
    );
  }

  showWorkflowHeader(index: number): boolean {
    if (index === 0) return true;
    return this.allMovementHistories[index].omh_workflow_id !== this.allMovementHistories[index - 1].omh_workflow_id;
  }

  getWorkflowName(id: number): string {
    switch(id) {
      case 2: return 'Return Journey';
      case 3: return 'Refund Status';
      default: return 'Purchase Journey';
    }
  }

  getWorkflowIcon(id: number): string {
    switch(id) {
      case 2: return 'fa-reply';
      case 3: return 'fa-university';
      default: return 'fa-shopping-bag';
    }
  }

  getWorkflowColor(id: number): string {
     switch(id) {
      case 2: return '#dc3545';
      case 3: return '#ffc107';
      default: return '#0d6efd';
    }
  }

  cancelCustomerOrder() {
    // Determine if the order is already confirmed (ID 1) or processed beyond confirmation (IDs 2, 3)
    // Orders in these stages require bank details for a Refund (Workflow 3)
    const refundRequiredStages = [1, 2, 3];
    const currentStatusId = this.customerOrder.co_status;

    if (refundRequiredStages.includes(currentStatusId)) {
      this.showCancelRefundForm = true;
      this.bankName = '';
      this.accountNo = '';
      this.ifscCode = '';
      return;
    }

    this.requestParms.id = this.orderId;
    this.requestParms.user = this.currentUser.u_id;
    if (confirm('Are you sure you want to cancel this order?')) {
      this.executeCancellation();
    }
  }

  submitCancelRefundRequest() {
    this.requestParms.id = this.orderId;
    this.requestParms.user = this.currentUser.u_id;
    
    // Automatic refund doesn't need bank details anymore
    this.executeCancellation();
    this.showCancelRefundForm = false;
  }

  private executeCancellation() {
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

  returnCustomerOrder() {
    this.showReturnForm = !this.showReturnForm;
  }

  submitReturnRequest() {
    if (!this.returnReason) {
      this.snackBarService.showError('Please select a reason for the return.');
      return;
    }

    const returnRequest: ReturnOrder = {
      ro_order_no: this.orderId,
      ro_reason: this.returnReason,
      ro_comments: this.returnComments,
      ro_cre_by: this.currentUser.u_id
    };

    if (confirm('Submit this return request? Refund will be processed automatically.')) {
      this.ireturnOrder.raiseReturnRequest(returnRequest).subscribe(
        (data: DbResult) => {
          if (data.message === "Success") {
            this.getOrderDetails();
            this.getOrderMovementHistory(this.orderId);
            this.showReturnForm = false;
            this.snackBarService.showSuccess('Return request submitted successfully.');
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
