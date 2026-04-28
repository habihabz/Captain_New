import { Component, OnInit, ViewChild } from '@angular/core';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { IPaymentService, RefundRequest } from '../../../services/ipayment.service';
import { SnackBarService } from '../../../services/isnackbar.service';
import { ICustomerOrder } from '../../../services/icustomer.order.service';
import { RequestParms } from '../../../models/requestParms';
import { AgGridAngular } from 'ag-grid-angular';
import { User } from '../../../models/user.model';
import { IuserService } from '../../../services/iuser.service';

@Component({
  selector: 'app-refund-management',
  templateUrl: './refund-management.component.html',
  styleUrl: './refund-management.component.css'
})
export class RefundManagementComponent implements OnInit {
  refundableOrders: any[] = [];
  rowCount: number = 0;
  activeTab: 'pending' | 'completed' = 'pending';
  currentUser: User = new User();
  requestParms: RequestParms = new RequestParms();
  
  @ViewChild('refundGrid') refundGrid!: AgGridAngular;

  // Pending Columns
  pendingColDefs: ColDef[] = [
    { headerName: "Order ID", field: "co_id", width: 100, cellClass: 'fw-bold' },
    { headerName: "Customer", field: "co_customer_name", flex: 1.2 },
    { 
      headerName: "Amount", 
      field: "co_net_amount", 
      width: 120,
      cellClass: 'fw-bold text-success',
      valueFormatter: p => "₹ " + Number(p.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
    },
    { 
      headerName: "Source ID", 
      field: "co_payment_id", 
      flex: 1.5,
      cellClass: 'text-muted small'
    },
    { 
      headerName: "Issue", 
      field: "co_is_canceled", 
      width: 150,
      valueFormatter: p => p.value === 'Y' ? 'CANCELLATION' : 'RETURNED',
      cellStyle: p => ({ color: p.value === 'Y' ? '#dc3545' : '#0d6efd', fontWeight: 'bold', fontSize: '11px' })
    },
    {
      headerName: 'Actions',
      width: 130,
      pinned: 'right',
      cellRenderer: (params: any) => {
        return `<button class="btn-issue-refund">
                  <i class="fa fa-money me-1"></i> Issue Refund
                </button>`;
      },
      onCellClicked: (params: any) => this.processRefund(params.data)
    }
  ];

  // History Columns
  historyColDefs: ColDef[] = [
    { headerName: "Order ID", field: "co_id", width: 100 },
    { headerName: "Customer", field: "co_customer_name", flex: 1.2 },
    { 
        headerName: "Refunded Amount", 
        field: "co_net_amount", 
        width: 140,
        cellClass: 'fw-bold text-success',
        valueFormatter: p => "₹ " + Number(p.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
    },
    { headerName: "Razorpay ID", field: "co_payment_id", flex: 1.5, cellClass: 'text-muted' },
    { 
        headerName: "Status", 
        field: "co_status_name", 
        width: 140,
        cellRenderer: () => `<span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill border border-success-subtle">COMPLETED</span>`
    }
  ];

  constructor(
    private paymentService: IPaymentService,
    private snackBarService: SnackBarService,
    private icustomerOrder: ICustomerOrder,
    private iuser: IuserService
  ) {
    this.currentUser = iuser.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    if (this.activeTab === 'pending') {
      this.loadRefundableOrders();
    } else {
      this.loadCompletedRefunds();
    }
  }

  setTab(tab: 'pending' | 'completed') {
    this.activeTab = tab;
    this.loadData();
  }

  loadRefundableOrders() {
    this.paymentService.getRefundableOrders(this.requestParms).subscribe({
      next: (data) => {
        this.refundableOrders = data;
        this.rowCount = data.length;
      },
      error: (err) => {
        this.snackBarService.showError("Failed to load refundable orders.");
      }
    });
  }

  loadCompletedRefunds() {
    this.paymentService.getCompletedRefunds(this.requestParms).subscribe({
      next: (data) => {
        this.refundableOrders = data;
        this.rowCount = data.length;
      },
      error: (err) => {
        this.snackBarService.showError("Failed to load refund history.");
      }
    });
  }

  applyFilters() {
    this.loadData();
  }

  onDateRangeChanged(event: { startDate: string, endDate: string }) {
    this.requestParms.startDate = event.startDate;
    this.requestParms.endDate = event.endDate;
    this.loadData();
  }

  resetFilters() {
    this.requestParms = new RequestParms();
    this.loadData();
  }

  processRefund(order: any) {
    if (!confirm(`Are you sure you want to refund ₹${order.co_net_amount} to ${order.co_customer_name}? This action is irreversible via Razorpay.`)) {
      return;
    }

    const request: RefundRequest = {
      paymentId: order.co_payment_id,
      amount: order.co_net_amount,
      orderId: order.co_id
    };

    this.paymentService.processRefund(request).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.snackBarService.showSuccess("Refund payout processed successfully via Razorpay!");
          this.updateOrderStatus(order.co_id, res.refundId);
        } else {
          this.snackBarService.showError(res.message || "Payout failed.");
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || err.error || err.message;
        
        // Handle "already refunded" case gracefully
        if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('fully refunded already')) {
          this.snackBarService.showSuccess("Payment was already refunded on Razorpay. Marking as completed.");
          this.updateOrderStatus(order.co_id, 'ALREADY_REFUNDED');
        } else {
          this.snackBarService.showError("Razorpay error: " + errorMsg);
        }
      }
    });
  }

  updateOrderStatus(orderId: number, refundId: string = '') {
    const params = new RequestParms();
    params.id = orderId;
    params.status = 15; // REFUND COMPLETED
    params.user = this.currentUser.u_id;
    params.refundId = refundId;
    params.completedYn = 'Y';

    this.icustomerOrder.updateStatusForCustomerOrder(params).subscribe({
      next: () => {
        this.loadData();
      }
    });
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }
}
