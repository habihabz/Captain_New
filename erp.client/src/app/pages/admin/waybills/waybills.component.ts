import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SnackBarService } from '../../../services/isnackbar.service';
import { ColDef, DomLayoutType, GridApi, GridReadyEvent } from 'ag-grid-community';

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
      cellClass: 'font-monospace fw-bold text-dark'
    },
    {
      headerName: "Status",
      field: "wb_status",
      width: 120,
      cellRenderer: (p: any) => {
        const isUsed = p.value === 'Used';
        return `<span class="grid-badge ${isUsed ? 'bg-success' : 'bg-warning'} text-white shadow-xs">${p.value || ''}</span>`;
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

  constructor(private http: HttpClient, private snackbar: SnackBarService) { }

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

      // Date — use wb_used_date for Used, wb_created_date for others
      const dateField = wb.wb_status === 'Used' ? wb.wb_used_date : wb.wb_created_date;
      const rowDate = dateField ? new Date(dateField) : null;
      const matchDate = (!from && !to) ||
        (rowDate ? ((!from || rowDate >= from) && (!to || rowDate <= to)) : false);

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
}
