import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ColDef, DomLayoutType, GridApi, GridReadyEvent } from 'ag-grid-community';
import { User } from '../../../models/user.model';
import { Subscription } from 'rxjs';
import { CustomerOrder } from '../../../models/customer.order.model';
import { Router } from '@angular/router';
import { SnackBarService } from '../../../services/isnackbar.service';
import { IuserService } from '../../../services/iuser.service';
import { ICustomerOrder } from '../../../services/icustomer.order.service';
import { RequestParms } from '../../../models/requestParms';
import { ActionRendererComponent } from '../../../directives/action.renderer';

declare var $: any;

@Component({
  selector: 'app-delhivery-shipment',
  templateUrl: './delhivery-shipment.component.html',
  styleUrls: ['./delhivery-shipment.component.css']
})
export class DelhiveryShipmentComponent implements OnInit, OnDestroy {
  private gridApi!: GridApi;
  currentUser: User = new User();
  orders: CustomerOrder[] = [];
  filteredOrders: CustomerOrder[] = [];
  currentTab: 'pending' | 'shipped' = 'pending';
  searchTerm: string = '';

  // Shipment Creation Modal fields
  shipmentOrderId: number = 0;
  shipmentWeight: number = 100;
  shipmentPaymentMode: string = 'Prepaid';
  shipmentWarehouses: any[] = [];
  selectedWarehouse: string = '';
  shipmentSubmitting: boolean = false;

  private subscription: Subscription = new Subscription();

  domLayout: DomLayoutType = 'autoHeight';
  frameworkComponents = {
    actionRenderer: ActionRendererComponent
  };
  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  colDefs: ColDef[] = [
    {
      headerName: "Order ID",
      field: "co_id",
      width: 100,
      cellClass: 'text-center fw-bold text-muted',
      cellRenderer: (p: any) => p.value ? `<span style="user-select: all; cursor: text;">${p.value}</span>` : '-'
    },
    {
      headerName: "Customer",
      field: "co_customer_name",
      flex: 1.5,
      cellClass: 'fw-bold text-dark'
    },
    {
      headerName: "Phone",
      field: "co_customer_phone",
      width: 130
    },
    {
      headerName: "Product",
      field: "p_name",
      flex: 1.2
    },
    { headerName: "Qty", field: "co_qty", width: 80, cellClass: 'text-center fw-bold' },
    {
      headerName: "Amount",
      field: "co_net_amount",
      width: 120,
      cellClass: 'text-end fw-bold text-success',
      valueFormatter: p => "₹ " + Number(p.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
    },
    {
      headerName: "Waybill Number",
      field: "co_waybill",
      width: 200,
      cellClass: 'font-monospace fw-bold text-primary',
      hide: true,
      cellRenderer: (p: any) => p.value
        ? `<span style="user-select: all; cursor: text; letter-spacing: 0.5px; font-size: 12px;">${p.value}</span>`
        : '<span class="text-muted">-</span>'
    },
    {
      headerName: "Shipped By",
      field: "omh_cre_by_name",
      width: 160,
      hide: true,
      cellClass: 'fw-bold text-dark',
      cellRenderer: (p: any) => p.value
        ? `<span>${p.value}</span>`
        : '<span class="text-muted">-</span>'
    },
    {
      headerName: "Shipped On",
      field: "omh_cre_date",
      width: 170,
      hide: true,
      cellRenderer: (p: any) => p.value
        ? `<span class="text-muted small">${new Date(p.value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>`
        : '<span class="text-muted">-</span>'
    },
    {
      headerName: 'Actions',
      width: 150,
      pinned: 'right',
      cellClass: 'text-center',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        actions: []
      }
    }
  ];

  constructor(
    private iuserService: IuserService,
    private icustomerOrder: ICustomerOrder,
    private snackBarService: SnackBarService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.currentUser = iuserService.getCurrentUser();
    if (this.currentUser.u_id == 0) {
      this.router.navigate(['login']);
    }
  }

  ngOnInit(): void {
    this.loadOrders();
    this.updateGridColumns();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.updateGridColumns();
  }

  exportCsv() {
    this.gridApi.exportDataAsCsv({
      fileName: `delhivery_shipments_${new Date().toISOString().split('T')[0]}.csv`
    });
  }

  setTab(tab: 'pending' | 'shipped') {
    this.currentTab = tab;
    this.updateGridColumns();
    this.applyFilters();
  }

  updateGridColumns() {
    // Show/hide Waybill column based on tab
    const waybillCol = this.colDefs.find(c => c.field === 'co_waybill');
    if (waybillCol) {
      waybillCol.hide = this.currentTab === 'pending';
    }

    // Show/hide Shipped By column based on tab
    const creByCol = this.colDefs.find(c => c.field === 'omh_cre_by_name');
    if (creByCol) {
      creByCol.hide = this.currentTab === 'pending';
    }

    // Show/hide Shipped On column based on tab
    const creDateCol = this.colDefs.find(c => c.field === 'omh_cre_date');
    if (creDateCol) {
      creDateCol.hide = this.currentTab === 'pending';
    }

    // Configure actions based on tab
    const actionsCol = this.colDefs.find(c => c.headerName === 'Actions');
    if (actionsCol) {
      actionsCol.hide = this.currentTab !== 'pending';
      if (actionsCol.cellRendererParams) {
        if (this.currentTab === 'pending') {
          actionsCol.cellRendererParams.actions = [
            {
              name: ' CREATE',
              tooltip: 'Create Delhivery Shipment',
              cssClass: 'btn btn-outline-primary btn-xs rounded-pill me-1',
              icon: 'fa fa-truck',
              action: 'onCreateShipment',
              onCreateShipment: (data: any) => this.openCreateShipmentModal(data)
            }
          ];
        } else {
          actionsCol.cellRendererParams.actions = [];
        }
      }
    }

    // Trigger ag-grid column refresh by creating a new array reference
    this.colDefs = [...this.colDefs];
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.colDefs);
    }
    this.cd.detectChanges();
  }

  loadOrders() {
    const params = new RequestParms();
    params.status = 0; // Fetch all orders (both pending status 1 and manifested status 2+)
    params.completedYn = 'A'; // Fetch all orders under this status

    this.icustomerOrder.getCustomerOrders(params).subscribe({
      next: (data: CustomerOrder[]) => {
        this.orders = data;
        this.applyFilters();
      },
      error: () => {
        this.snackBarService.showError("Failed to load orders.");
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    this.filteredOrders = this.orders.filter(order => {
      // Tab filter
      const matchesTab = this.currentTab === 'pending'
        ? (!order.co_waybill && order.co_status === 1)
        : !!order.co_waybill;
      if (!matchesTab) return false;

      // Search filter
      if (!term) return true;
      return (
        order.co_id.toString().includes(term) ||
        (order.co_customer_name && order.co_customer_name.toLowerCase().includes(term)) ||
        (order.co_customer_phone && order.co_customer_phone.includes(term)) ||
        (order.p_name && order.p_name.toLowerCase().includes(term)) ||
        (order.co_waybill && order.co_waybill.toLowerCase().includes(term))
      );
    });
  }

  openCreateShipmentModal(data: any) {
    this.shipmentOrderId = data.co_id;
    this.shipmentPaymentMode = data.co_payment_id ? 'Prepaid' : 'COD';
    this.shipmentWeight = 100;
    this.selectedWarehouse = '';

    // Retrieve product's packaging type volumetric weight
    this.icustomerOrder.calculateOrderWeight(data.co_id).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.shipmentWeight = res.weight;
        }
      }
    });

    // Load registered warehouses
    this.icustomerOrder.getDelhiveryWarehouses().subscribe({
      next: (res) => {
        this.shipmentWarehouses = res;
        if (res && res.length > 0) {
          this.selectedWarehouse = res[0].dw_name;
        } else {
          this.snackBarService.showError("No registered Delhivery warehouses found. Please configure a warehouse first.");
        }
      },
      error: () => {
        this.snackBarService.showError("Failed to load registered Delhivery warehouses.");
      }
    });

    $("#DelhiveryShipmentModal").modal("show");
  }

  closeModal(event: any, modalId: string) {
    $(`#${modalId}`).modal("hide");
  }

  submitDelhiveryShipment() {
    if (!this.selectedWarehouse) {
      this.snackBarService.showError("Please select a registered pickup location.");
      return;
    }
    this.shipmentSubmitting = true;

    const request = {
      order_id: this.shipmentOrderId,
      pickup_location: this.selectedWarehouse,
      payment_mode: this.shipmentPaymentMode,
      weight: this.shipmentWeight,
      cre_by: this.currentUser.u_id
    };

    this.icustomerOrder.createDelhiveryShipment(request).subscribe({
      next: (res) => {
        this.shipmentSubmitting = false;
        if (res && res.success) {
          this.snackBarService.showSuccess("Shipment created successfully! Waybill: " + res.waybill);
          $("#DelhiveryShipmentModal").modal("hide");
          this.loadOrders(); // Reload orders grid
        } else {
          this.snackBarService.showError(res.message || "Failed to create shipment.");
        }
      },
      error: (err) => {
        const errMsg = err.error?.message || "Failed to create Delhivery shipment.";
        this.snackBarService.showError(errMsg);
      }
    });
  }
}
