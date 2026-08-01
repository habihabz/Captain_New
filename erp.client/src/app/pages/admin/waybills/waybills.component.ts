import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SnackBarService } from '../../../services/isnackbar.service';
import { ColDef, DomLayoutType, GridApi, GridReadyEvent } from 'ag-grid-community';
import { ICustomerOrder } from '../../../services/icustomer.order.service';

declare var $: any;

@Component({
  selector: 'app-waybills',
  templateUrl: './waybills.component.html',
  styleUrls: ['./waybills.component.css']
})
export class WaybillsComponent implements OnInit {
  apiUrl = environment.serverHostAddress;
  waybills: any[] = [];
  filteredWaybills: any[] = [];
  searchTerm: string = '';
  statusFilter: string = 'Used';
  fetchCount: number = 25;
  loading: boolean = false;
  fetching: boolean = false;

  // Date filter — default to 1st of current month → today
  dateFrom: string = (() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  })();
  dateTo: string = new Date().toISOString().split('T')[0];

  domLayout: DomLayoutType = 'autoHeight';
  frameworkComponents = {};
  private gridApi!: GridApi;
  defaultColDef = {
    sortable: true,
    filter: true
  };

  colDefs: ColDef[] = [
    {
      headerName: "ID",
      field: "wb_id",
      width: 80,
      cellClass: 'text-center fw-bold text-muted'
    },
    {
      headerName: "Waybill Number",
      field: "wb_number",
      flex: 1.5,
      cellClass: 'font-monospace fw-bold',
      cellRenderer: (p: any) => p.value
        ? `<span style="font-family: monospace; font-size: 13px; color: #0f172a; cursor: pointer;" title="Click to Track Shipment"><i class="fa fa-location-arrow text-primary me-1" style="font-size: 11px;"></i>${p.value}</span>`
        : '<span class="text-muted">-</span>'
    },
    {
      headerName: "Status",
      field: "wb_status",
      width: 120,
      cellRenderer: (p: any) => {
        const isUsed = p.value === 'Used';
        return isUsed
          ? `<span class="badge bg-success-subtle text-success px-2.5 py-1 rounded-pill fw-bold border border-success-subtle" style="font-size: 10px; letter-spacing: 0.5px;">USED</span>`
          : `<span class="badge bg-warning-subtle text-warning px-2.5 py-1 rounded-pill fw-bold border border-warning-subtle" style="font-size: 10px; letter-spacing: 0.5px;">UNUSED</span>`;
      }
    },
    {
      headerName: "Order ID",
      field: "wb_order_id",
      width: 110,
      cellClass: 'text-center fw-bold text-muted',
      cellRenderer: (p: any) => p.value ? `<span style="user-select: all; cursor: text;">${p.value}</span>` : '<span class="text-muted">-</span>'
    },
    {
      headerName: "Used Date",
      field: "wb_used_date",
      flex: 1.5,
      cellRenderer: (p: any) => p.value ? new Date(p.value).toLocaleString() : '<span class="text-muted">-</span>'
    },
    {
      headerName: "Created Date",
      field: "wb_created_date",
      flex: 1.5,
      cellRenderer: (p: any) => p.value ? new Date(p.value).toLocaleString() : '<span class="text-muted">-</span>'
    }
  ];

  constructor(
    private http: HttpClient,
    private snackbar: SnackBarService,
    private icustomerOrder: ICustomerOrder
  ) { }

  ngOnInit(): void {
    this.loadWaybills();
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    event.api.sizeColumnsToFit();
  }

  exportCsv() {
    this.gridApi.exportDataAsCsv({
      fileName: `waybills_${new Date().toISOString().split('T')[0]}.csv`
    });
  }

  loadWaybills() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/api/Delhivery/waybills`).subscribe({
      next: (data) => {
        this.waybills = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.snackbar.showError("Failed to load waybills.");
      }
    });
  }

  onDateRangeChange(event: { startDate: string, endDate: string }) {
    this.dateFrom = event.startDate;
    this.dateTo = event.endDate;
    this.applyFilters();
  }

  applyFilters() {
    const from = this.dateFrom ? new Date(this.dateFrom) : null;
    const to = this.dateTo ? new Date(this.dateTo + 'T23:59:59') : null;

    this.filteredWaybills = this.waybills.filter(wb => {
      // Search
      const matchSearch = !this.searchTerm ||
        wb.wb_number.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (wb.wb_order_id && String(wb.wb_order_id).includes(this.searchTerm));

      // Status
      const matchStatus = this.statusFilter === 'All' || wb.wb_status === this.statusFilter;

      // Date Range — ONLY applies to Used waybills
      let matchDate = true;
      if (from || to) {
        if (wb.wb_status === 'Used') {
          const rowDate = wb.wb_used_date ? new Date(wb.wb_used_date) : null;
          matchDate = rowDate ? ((!from || rowDate >= from) && (!to || rowDate <= to)) : false;
        } else {
          // Unused waybills are NOT filtered by date range
          matchDate = true;
        }
      }

      return matchSearch && matchStatus && matchDate;
    });
  }

  fetchNewWaybills() {
    if (this.fetchCount <= 0 || this.fetchCount > 100) {
      this.snackbar.showError("Please enter a count between 1 and 100.");
      return;
    }
    this.fetching = true;
    this.http.post<any>(`${this.apiUrl}/api/Delhivery/fetchWaybills`, this.fetchCount).subscribe({
      next: (res) => {
        this.fetching = false;
        if (res && res.success) {
          this.snackbar.showSuccess(res.message);
          this.loadWaybills();
        } else {
          this.snackbar.showError(res.message || "Failed to fetch waybills.");
        }
      },
      error: (err) => {
        this.fetching = false;
        this.snackbar.showError("Failed to fetch waybills.");
      }
    });
  }

  // Tracking Modal State
  trackingWaybill: string = '';
  trackingLoading: boolean = false;
  trackingError: string = '';
  trackingDetails: any = null;

  onCellClicked(event: any) {
    if (event.colDef && event.colDef.field === 'wb_number' && event.value) {
      this.openTrackingModal(event.value, event.data?.wb_order_id || '');
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

  closeModal(event: any, modalId: string) {
    $(`#${modalId}`).modal("hide");
  }
}
