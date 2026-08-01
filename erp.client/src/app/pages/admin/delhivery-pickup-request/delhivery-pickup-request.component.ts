import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SnackBarService } from '../../../services/isnackbar.service';
import { IuserService } from '../../../services/iuser.service';
import { User } from '../../../models/user.model';
import { environment } from '../../../../environments/environment';
import { ColDef, DomLayoutType } from 'ag-grid-community';

declare var $: any;

@Component({
  selector: 'app-delhivery-pickup-request',
  templateUrl: './delhivery-pickup-request.component.html',
  styleUrls: ['./delhivery-pickup-request.component.css']
})
export class DelhiveryPickupRequestComponent implements OnInit {
  apiUrl = environment.serverHostAddress;
  currentUser: User = new User();
  warehouses: any[] = [];
  history: any[] = [];
  
  pickupData: any = {
    pickup_location: '',
    pickup_date: '',
    pickup_time: '11:00:00',
    expected_package_count: 1,
    cre_by: 0
  };

  tomorrowDateStr: string = '';

  loading: boolean = false;
  submitting: boolean = false;
  domLayout: DomLayoutType = 'autoHeight';

  colDefs: ColDef[] = [
    { headerName: "ID", width: 80, field: "dpr_id" },
    { headerName: "Pickup ID", width: 120, field: "dpr_pickup_id" },
    { headerName: "Pickup Location", field: "dpr_location" },
    { 
      headerName: "Pickup Date", 
      field: "dpr_date",
      cellRenderer: (p: any) => {
        if (!p.value) return '';
        const d = new Date(p.value);
        return d.toLocaleDateString();
      }
    },
    { headerName: "Pickup Time", field: "dpr_time" },
    { headerName: "Expected Packages", field: "dpr_package_count", width: 150 },
    { 
      headerName: "Status", 
      field: "dpr_status",
      cellClass: 'text-center',
      cellRenderer: (p: any) => {
        const isSuccess = p.value === 'Success';
        return `<span class="grid-badge ${isSuccess ? 'bg-success' : 'bg-danger'} text-white shadow-xs">${p.value}</span>`;
      }
    },
    { headerName: "Created By", field: "dpr_cre_by_name" },
    { 
      headerName: "Created On", 
      field: "dpr_cre_date",
      cellRenderer: (p: any) => {
        if (!p.value) return '';
        const d = new Date(p.value);
        return d.toLocaleString();
      }
    }
  ];

  defaultColDef = {
    sortable: true,
    filter: true
  };

  constructor(
    private http: HttpClient, 
    private snackbar: SnackBarService,
    private iuserService: IuserService
  ) {
    this.currentUser = this.iuserService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadRegisteredWarehouses();
    this.loadHistory();
  }

  unscheduledCount: number = 0;

  openCreateModal() {
    if (this.warehouses.length === 0) {
      this.snackbar.showError("No registered warehouses available to create a pickup request.");
      return;
    }
    
    // Reset form defaults to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    this.tomorrowDateStr = `${yyyy}-${mm}-${dd}`;

    this.pickupData = {
      pickup_location: this.warehouses[0].dw_name,
      pickup_date: this.tomorrowDateStr,
      pickup_time: "11:00:00",
      expected_package_count: 1,
      cre_by: this.currentUser.u_id
    };

    // Auto-fetch count of unscheduled used waybills
    this.http.get<any>(`${this.apiUrl}/api/Delhivery/unscheduled-waybill-count`).subscribe({
      next: (res) => {
        const count = res && typeof res.count === 'number' ? res.count : 0;
        this.unscheduledCount = count;
        if (count > 0) {
          this.pickupData.expected_package_count = count;
        }
      },
      error: () => {
        this.unscheduledCount = 0;
      }
    });

    $('#pickupRequestModal').modal('show');
  }

  loadRegisteredWarehouses() {
    this.http.get<any[]>(`${this.apiUrl}/api/Delhivery/warehouses`)
      .subscribe({
        next: (res) => {
          this.warehouses = (res || []).filter(w => w.dw_registered_yn === 'Y');
        },
        error: (err) => {
          this.snackbar.showError("Failed to load registered warehouses");
        }
      });
  }

  loadHistory() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/api/Delhivery/pickup-requests`)
      .subscribe({
        next: (res) => {
          this.history = res || [];
          this.loading = false;
        },
        error: (err) => {
          this.snackbar.showError("Failed to load pickup requests history");
          this.loading = false;
        }
      });
  }

  submitPickupRequest() {
    if (!this.pickupData.pickup_location || !this.pickupData.pickup_date || !this.pickupData.pickup_time || !this.pickupData.expected_package_count) {
      this.snackbar.showError("Please fill in all required fields.");
      return;
    }

    let time = this.pickupData.pickup_time;
    if (time && time.length === 5) {
      time = time + ":00";
    }
    this.pickupData.pickup_time = time;
    this.pickupData.cre_by = this.currentUser.u_id;

    this.submitting = true;
    this.http.post<any>(`${this.apiUrl}/api/Delhivery/pickup-request`, this.pickupData)
      .subscribe({
        next: (res) => {
          this.snackbar.showSuccess(res.message || "Pickup request created successfully.");
          $('#pickupRequestModal').modal('hide');
          this.submitting = false;
          this.loadHistory();
        },
        error: (err) => {
          let msg = "Failed to create pickup request.";
          if (err.error && typeof err.error === 'object') {
            msg = err.error.message || err.error.error || msg;
            
            if (err.error.data) {
              try {
                const parsedData = JSON.parse(err.error.data);
                const firstKey = Object.keys(parsedData)[0];
                if (firstKey && Array.isArray(parsedData[firstKey]) && parsedData[firstKey].length > 0) {
                  msg = parsedData[firstKey][0];
                } else if (firstKey && typeof parsedData[firstKey] === 'string') {
                  msg = parsedData[firstKey];
                }
              } catch (e) {
                // Ignore parse errors and fallback
              }
            }
          } else if (err.error && typeof err.error === 'string') {
            msg = err.error;
          }
          this.snackbar.showError(msg);
          this.submitting = false;
          this.loadHistory();
        }
      });
  }
}
