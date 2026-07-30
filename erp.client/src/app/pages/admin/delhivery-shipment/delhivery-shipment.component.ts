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
  selectedDatePreset: string = 'last7';
  startDate: string = '';
  endDate: string = '';

  // Shipment Creation Modal fields
  shipmentOrderId: number = 0;
  shipmentWeight: number = 100;
  shipmentPaymentMode: string = 'Prepaid';
  allowOverridePaymentMode: boolean = false;
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
      headerName: "Payment Method",
      field: "co_payment_method_name",
      width: 150,
      cellClass: 'text-center fw-bold',
      cellRenderer: (p: any) => {
        const val = p.value ? p.value.toString().trim() : '';
        if (!val || val === 'null' || val === 'undefined') {
          return `<span class="text-muted">-</span>`;
        }
        const isCod = val.toLowerCase().includes('cash') || p.data?.co_payment_method === 39;
        return isCod 
          ? `<span class="badge bg-warning text-dark px-2 py-1" style="font-size: 11px;"><i class="fa fa-money me-1"></i>${val}</span>`
          : `<span class="badge bg-success text-white px-2 py-1" style="font-size: 11px;"><i class="fa fa-qrcode me-1"></i>${val}</span>`;
      }
    },
    {
      headerName: "Waybill Number",
      field: "co_waybill",
      width: 200,
      hide: true,
      cellClass: 'text-center fw-bold',
      cellRenderer: (p: any) => (p.value && p.value.toString().trim() !== '' && p.value.toString().trim() !== 'null')
        ? `<span style="font-family: monospace; font-weight: bold; color: #0d6efd;">${p.value}</span>`
        : '<span class="text-muted">-</span>'
    },
    {
      headerName: "Shipped By",
      field: "co_shipment_cre_by",
      width: 160,
      hide: true,
      cellClass: 'fw-bold text-dark',
      cellRenderer: (p: any) => (p.value && p.value.trim())
        ? `<span>${p.value}</span>`
        : '<span class="text-muted">-</span>'
    },
    {
      headerName: "Shipped On",
      field: "co_shipment_cre_on",
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

  onDateRangeChange(range: { startDate: string, endDate: string }) {
    this.startDate = range.startDate;
    this.endDate = range.endDate;
    this.loadCreatedShipments();
  }

  onDatePresetChange() {
    this.applyDatePreset(this.selectedDatePreset);
    if (this.selectedDatePreset !== 'custom') {
      this.loadCreatedShipments();
    }
  }

  applyDatePreset(preset: string) {
    const now = new Date();
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'today') {
      this.startDate = formatDate(now);
      this.endDate = formatDate(now);
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(now.getDate() - 1);
      this.startDate = formatDate(y);
      this.endDate = formatDate(y);
    } else if (preset === 'last7') {
      const d = new Date();
      d.setDate(now.getDate() - 6);
      this.startDate = formatDate(d);
      this.endDate = formatDate(now);
    } else if (preset === 'last30') {
      const d = new Date();
      d.setDate(now.getDate() - 29);
      this.startDate = formatDate(d);
      this.endDate = formatDate(now);
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      this.startDate = formatDate(firstDay);
      this.endDate = formatDate(now);
    } else if (preset === 'lastMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      this.startDate = formatDate(firstDay);
      this.endDate = formatDate(lastDay);
    } else if (preset === 'all') {
      this.startDate = '';
      this.endDate = '';
    }
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
    this.loadOrders();
  }

  updateGridColumns() {
    // Show/hide Waybill column based on tab
    const waybillCol = this.colDefs.find(c => c.field === 'co_waybill');
    if (waybillCol) {
      waybillCol.hide = this.currentTab === 'pending';
    }

    // Show/hide Shipped By column based on tab
    const creByCol = this.colDefs.find(c => c.field === 'co_shipment_cre_by');
    if (creByCol) {
      creByCol.hide = this.currentTab === 'pending';
    }

    // Show/hide Shipped On column based on tab
    const creDateCol = this.colDefs.find(c => c.field === 'co_shipment_cre_on');
    if (creDateCol) {
      creDateCol.hide = this.currentTab === 'pending';
    }

    // Configure actions based on tab
    const actionsCol = this.colDefs.find(c => c.headerName === 'Actions');
    if (actionsCol) {
      actionsCol.hide = false;
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
          actionsCol.cellRendererParams.actions = [
            {
              name: ' TRACK',
              tooltip: 'Track Delhivery Shipment',
              cssClass: 'btn btn-outline-warning btn-xs rounded-pill me-1',
              icon: 'fa fa-map-marker',
              action: 'onTrackShipment',
              onTrackShipment: (data: any) => this.openTrackingModal(data.co_waybill, data.co_id)
            }
          ];
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
    if (this.currentTab === 'pending') {
      this.loadPendingOrders();
    } else {
      this.loadCreatedShipments();
    }
  }

  loadPendingOrders() {
    const params = new RequestParms();
    params.status = 1;

    this.icustomerOrder.getOrdersForShipment(params).subscribe({
      next: (data: CustomerOrder[]) => {
        this.orders = data;
        this.applyFilters();
      },
      error: () => {
        this.snackBarService.showError("Failed to load pending orders.");
      }
    });
  }

  loadCreatedShipments() {
    if (!this.startDate || !this.endDate) {
      this.orders = [];
      this.applyFilters();
      return;
    }

    const params = new RequestParms();
    params.startDate = this.startDate;
    params.endDate = this.endDate;

    this.icustomerOrder.getCreatedShipments(params).subscribe({
      next: (data: CustomerOrder[]) => {
        this.orders = data;
        this.applyFilters();
      },
      error: () => {
        this.snackBarService.showError("Failed to load created shipments.");
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    this.filteredOrders = this.orders.filter(order => {
      // Pending Shipments = status 1 (Order Confirmed)
      // Created Shipments = status 2 (Shipped)
      const matchesTab = this.currentTab === 'pending'
        ? (order.co_status === 1)
        : (order.co_status === 2 || !!order.co_waybill);
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
    this.shipmentPaymentMode = (data.co_payment_method === 39 || data.co_payment_method_name === 'Cash' || !data.co_payment_id) ? 'COD' : 'Prepaid';
    this.allowOverridePaymentMode = false;
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
        this.shipmentSubmitting = false;
      }
    });
  }

  // Tracking Modal State
  trackingWaybill: string = '';
  trackingLoading: boolean = false;
  trackingError: string = '';
  trackingDetails: any = null;

  onCellClicked(event: any) {
    if (event.colDef && event.colDef.field === 'co_waybill' && event.value) {
      this.openTrackingModal(event.value, event.data?.co_id || '');
    }
  }

  openTrackingModal(waybill: string, refId: string = '') {
    if (!waybill) return;
    this.trackingWaybill = waybill;
    this.trackingLoading = true;
    this.trackingError = '';
    this.trackingDetails = null;

    $("#DelhiveryTrackingModal").modal("show");

    this.icustomerOrder.trackDelhiveryShipment(waybill, refId).subscribe({
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

    this.trackingDetails = {
      awb: shipmentData.AWB || shipmentData.waybill || waybill,
      status: statusObj.Status || statusObj.status || shipmentData.status || 'Manifested',
      statusDate: statusObj.StatusDateTime || statusObj.status_date_time,
      instructions: statusObj.Instructions || statusObj.instructions || statusObj.remarks || '',
      expectedDate: shipmentData.ExpectedDeliveryDate || shipmentData.expected_delivery_date,
      origin: originObj.City || shipmentData.Origin || shipmentData.origin || '',
      destination: consigneeObj.City || shipmentData.Destination || shipmentData.destination || '',
      consigneeName: consigneeObj.Name || shipmentData.consignee_name || '',
      scans: scansList
    };
  }

  printShippingLabel(waybill: string, pdfSize: string = '4R') {
    if (!waybill) return;
    this.icustomerOrder.printShippingLabelInNewTab(waybill, pdfSize);
  }
}
