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
  trackingWaybill: string = '';
  trackingLoading: boolean = false;
  trackingError: string = '';
  trackingDetails: any = null;

  getOrderDetails(): void {

    this.icustomerOrder.getCustomerOrder(this.orderId).subscribe(
      (data: CustomerOrder) => {
        this.customerOrder = data;
        this.resolveOrderItemImage(this.customerOrder);
        this.getOrderMovementHistory(this.orderId);

        if (this.customerOrder.co_waybill) {
          this.loadTrackingForOrder(this.customerOrder.co_waybill, this.customerOrder.co_id);
        }
      },
      (error) => {
      }
    );
  }

  loadTrackingForOrder(waybill: string, refId: any = '') {
    if (!waybill) return;
    this.trackingWaybill = waybill;
    this.trackingLoading = true;
    this.trackingError = '';
    this.trackingDetails = null;

    this.icustomerOrder.trackDelhiveryShipment(waybill, String(refId || '')).subscribe({
      next: (res) => {
        this.trackingLoading = false;
        this.parseTrackingResponse(res, waybill);
      },
      error: (err) => {
        this.trackingLoading = false;
        this.trackingError = err.error?.message || "Failed to fetch tracking details from Delhivery.";
      }
    });
  }

  parseTrackingResponse(res: any, waybill: string) {
    if (!res || !res.success || !res.data) {
      this.trackingError = res?.message || "No tracking data found for waybill: " + waybill;
      return;
    }

    const data = res.data;
    let shipmentData = null;

    if (data.ShipmentData && Array.isArray(data.ShipmentData) && data.ShipmentData.length > 0) {
      shipmentData = data.ShipmentData[0].Shipment;
    } else if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
      shipmentData = data.packages[0];
    } else if (typeof data === 'object') {
      shipmentData = data;
    }

    if (!shipmentData) {
      this.trackingError = "No tracking information found for waybill: " + waybill;
      return;
    }

    const statusObj = shipmentData.Status || {};
    const consigneeObj = shipmentData.Consignee || {};
    const originObj = shipmentData.OriginRec || {};

    const rawScans = shipmentData.Scans || shipmentData.scans || [];
    const scansList = rawScans.map((s: any) => {
      const detail = s.ScanDetail || s;
      return {
        Scan: detail.Scan || detail.scan || detail.instructions || detail.ScanType || 'Scanned',
        ScanType: detail.ScanType || '',
        ScanDateTime: detail.ScanDateTime || detail.scan_date_time || detail.date,
        ScannedLocation: detail.ScannedLocation || detail.location || detail.scanned_location || '',
        Instructions: detail.Instructions || detail.instructions || detail.remarks || ''
      };
    });

    const statusType = String(statusObj.StatusType || statusObj.status_type || shipmentData.status_type || '').toUpperCase();
    const rawStatus = String(statusObj.Status || statusObj.status || shipmentData.status || '');
    
    // Check if shipment is converted to Return Shipment (RT / RTO)
    const isReturnShipment = statusType === 'RT' || rawStatus.toLowerCase().includes('rto') || rawStatus.toLowerCase().includes('return');
    
    let displayStatus = rawStatus || 'Manifested';
    if (statusType === 'RT') {
      displayStatus = `RT - Return (${rawStatus})`;
    } else if (rawStatus.toUpperCase() === 'RTO') {
      displayStatus = `RTO - Returned to Origin`;
    }

    this.trackingDetails = {
      awb: shipmentData.AWB || shipmentData.waybill || waybill,
      status: displayStatus,
      rawStatus: rawStatus,
      statusType: statusType,
      isReturnShipment: isReturnShipment,
      statusDate: statusObj.StatusDateTime || statusObj.status_date_time,
      instructions: statusObj.Instructions || statusObj.instructions || statusObj.remarks || '',
      expectedDate: shipmentData.ExpectedDeliveryDate || shipmentData.expected_delivery_date,
      origin: originObj.City || shipmentData.Origin || shipmentData.origin || '',
      destination: consigneeObj.City || shipmentData.Destination || shipmentData.destination || '',
      consigneeName: consigneeObj.Name || shipmentData.consignee_name || '',
      scans: scansList
    };

    // 1. Auto-sync ERP Order Status to Delivered (3) if Status is "Delivered"
    const currentStatus = String(rawStatus || '').toLowerCase();
    if (currentStatus.includes('deliver') && !isReturnShipment && this.customerOrder && this.customerOrder.co_status !== 3) {
      this.customerOrder.co_status = 3;
      const omh = new OrderMovementHistory();
      omh.omh_id = 0;
      omh.omh_order_no = this.customerOrder.co_id;
      omh.omh_status = 3;
      omh.omh_cre_by = this.currentUser?.u_id || 1;

      this.iOrderMovementHistoryService.createOrderMovementHistory(omh).subscribe({
        next: () => {
          this.getOrderMovementHistory(this.customerOrder.co_id);
        }
      });
    }

    // 2. Auto-sync Return Journey if Return Shipment (RT / RTO) is detected from Delhivery
    if (isReturnShipment && this.customerOrder && !this.isReturnActive) {
      this.isReturnActive = true;
      const omh = new OrderMovementHistory();
      omh.omh_id = 0;
      omh.omh_order_no = this.customerOrder.co_id;
      omh.omh_status = 14; // Return / RTO Initiated
      omh.omh_cre_by = this.currentUser?.u_id || 1;

      this.iOrderMovementHistoryService.createOrderMovementHistory(omh).subscribe({
        next: () => {
          this.getOrderMovementHistory(this.customerOrder.co_id);
        }
      });
    }
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
    if (!this.customerOrder) return false;
    const stName = (this.customerOrder.co_status_name || '').toLowerCase();
    const trackingStatus = (this.trackingDetails?.status || '').toLowerCase();
    return this.customerOrder.co_status === 3 || 
           stName.includes('deliver') || 
           trackingStatus.includes('deliver');
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
    this.icustomerOrder.invoice(this.orderId).subscribe({
      next: (data: Blob) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (!win) {
          const a = document.createElement('a');
          a.href = url;
          a.download = `Tax_Invoice_Order_${this.orderId}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      },
      error: () => {
        this.snackBarService.showError('Error downloading tax invoice.');
      }
    });
  }

  isCashOnDelivery(): boolean {
    if (!this.customerOrder) return false;
    const pmName = (this.customerOrder.co_payment_method_name || '').toLowerCase();
    return pmName.includes('cash') || this.customerOrder.co_payment_method === 39;
  }

  isPrepaid(): boolean {
    return !this.isCashOnDelivery();
  }

  allMovementHistories: any[] = [];

  getOrderMovementHistory(co_id: number) {
    this.iOrderMovementHistoryService.getOrderMovementHistoriesByOrder(co_id).subscribe(
      (data: OrderMovementHistory[]) => {
        if (this.isCashOnDelivery()) {
          this.allMovementHistories = data.filter(omh => omh.omh_workflow_id !== 3);
        } else {
          this.allMovementHistories = data;
        }
        
        this.orderMovementHistories = data.filter(omh => omh.omh_workflow_id === 1);
        this.isReturnActive = data.some(omh => omh.omh_workflow_id === 2);
        this.isRefundActive = !this.isCashOnDelivery() && (data.some(omh => omh.omh_workflow_id === 3) || this.isOrderCanceled());
      }
    );
  }

  showWorkflowHeader(index: number): boolean {
    if (!this.allMovementHistories[index]) return false;
    if (this.isCashOnDelivery() && this.allMovementHistories[index].omh_workflow_id === 3) return false;
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
    // Orders in these stages require bank details for a Refund (Workflow 3) if Prepaid
    const refundRequiredStages = [1, 2, 3];
    const currentStatusId = this.customerOrder.co_status;

    if (this.isPrepaid() && refundRequiredStages.includes(currentStatusId)) {
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
            const omh = new OrderMovementHistory();
            omh.omh_id = 0;
            omh.omh_order_no = this.orderId;
            omh.omh_status = 14; // Return / RTO Initiated
            omh.omh_cre_by = this.currentUser?.u_id || 1;

            this.iOrderMovementHistoryService.createOrderMovementHistory(omh).subscribe(() => {
              this.getOrderDetails();
              this.getOrderMovementHistory(this.orderId);
            });

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
