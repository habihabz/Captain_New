import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SnackBarService } from '../../../services/isnackbar.service';
import { ColDef, DomLayoutType } from 'ag-grid-community';
import { ActionRendererComponent } from '../../../directives/action.renderer';

declare var $: any;

@Component({
  selector: 'app-delhivery-warehouse',
  templateUrl: './delhivery-warehouse.component.html',
  styleUrls: ['./delhivery-warehouse.component.css']
})
export class DelhiveryWarehouseComponent implements OnInit {
  apiUrl = environment.serverHostAddress;
  warehouses: any[] = [];
  warehouse: any = {};
  loading: boolean = false;
  saving: boolean = false;

  domLayout: DomLayoutType = 'autoHeight';
  frameworkComponents = {
    actionRenderer: ActionRendererComponent
  };
  defaultColDef = {
    sortable: true,
    filter: true
  };

  colDefs: ColDef[] = [
    {
      headerName: "ID",
      field: "dw_id",
      width: 70,
      cellClass: 'text-center fw-bold text-muted'
    },
    {
      headerName: "Warehouse Name",
      field: "dw_name",
      flex: 1.5,
      cellClass: 'fw-bold text-dark'
    },
    {
      headerName: "Address",
      field: "dw_address",
      flex: 2
    },
    {
      headerName: "City",
      field: "dw_city",
      width: 120
    },
    {
      headerName: "State",
      field: "dw_state",
      width: 120
    },
    {
      headerName: "Pincode",
      field: "dw_pincode",
      width: 100,
      cellClass: 'text-center font-monospace'
    },
    {
      headerName: "Phone",
      field: "dw_phone",
      width: 120,
      cellClass: 'text-center'
    },
    {
      headerName: "Delhivery Registered",
      field: "dw_registered_yn",
      width: 150,
      cellClass: 'text-center',
      cellRenderer: (p: any) => {
        const isRegistered = p.value === 'Y';
        return `<span class="grid-badge ${isRegistered ? 'bg-success' : 'bg-warning'} text-white shadow-xs">${isRegistered ? 'Registered' : 'Not Registered'}</span>`;
      }
    },
    {
      headerName: 'Actions',
      width: 180,
      pinned: 'right',
      cellClass: 'text-center',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        actions: [
          {
            name: '',
            tooltip: 'Edit Warehouse',
            cssClass: 'btn btn-outline-info btn-xs rounded-pill me-1',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.editWarehouse(data)
          },
          {
            name: '',
            tooltip: 'Register with Delhivery',
            cssClass: 'btn btn-outline-success btn-xs rounded-pill me-1',
            icon: 'fa fa-cloud-upload',
            action: 'onRegister',
            onRegister: (data: any) => this.registerWarehouse(data.dw_id)
          },
          {
            name: '',
            tooltip: 'Delete Warehouse',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash',
            action: 'onDelete',
            onDelete: (data: any) => this.deleteWarehouse(data.dw_id)
          }
        ]
      }
    }
  ];

  constructor(private http: HttpClient, private snackbar: SnackBarService) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/api/Delhivery/warehouses`)
      .subscribe({
        next: (res) => {
          this.warehouses = res || [];
          this.loading = false;
        },
        error: (err) => {
          this.snackbar.showError("Failed to load warehouses");
          this.loading = false;
        }
      });
  }

  createWarehouse() {
    this.warehouse = {
      dw_id: 0,
      dw_name: '',
      dw_address: '',
      dw_city: '',
      dw_state: '',
      dw_country: 'India',
      dw_pincode: '',
      dw_phone: '',
      dw_email: '',
      dw_registered_yn: 'N'
    };
    $('#warehouseModal').modal('show');
  }

  editWarehouse(data: any) {
    this.warehouse = { ...data };
    $('#warehouseModal').modal('show');
  }

  saveWarehouse() {
    if (!this.warehouse.dw_name || !this.warehouse.dw_address || !this.warehouse.dw_city || 
        !this.warehouse.dw_state || !this.warehouse.dw_pincode || !this.warehouse.dw_phone) {
      this.snackbar.showError("Please fill in all required fields.");
      return;
    }

    this.saving = true;
    if (this.warehouse.dw_id === 0) {
      this.http.post<any>(`${this.apiUrl}/api/Delhivery/warehouses`, this.warehouse)
        .subscribe({
          next: (res) => {
            if (res.dw_registered_yn === 'Y') {
              this.snackbar.showSuccess("Warehouse created and registered with Delhivery successfully!");
            } else {
              this.snackbar.showSuccess("Warehouse created locally. Delhivery registration pending (retry from actions).");
            }
            this.loadWarehouses();
            $('#warehouseModal').modal('hide');
            this.saving = false;
          },
          error: (err) => {
            let msg = "Failed to create warehouse";
            if (err.error && typeof err.error === 'object') {
              msg = err.error.message || err.error.error || msg;
            } else if (err.error && typeof err.error === 'string') {
              msg = err.error;
            }
            this.snackbar.showError(msg);
            this.saving = false;
          }
        });
    } else {
      this.http.put<any>(`${this.apiUrl}/api/Delhivery/warehouses/${this.warehouse.dw_id}`, this.warehouse)
        .subscribe({
          next: (res) => {
            if (res.dw_registered_yn === 'Y') {
              this.snackbar.showSuccess("Warehouse updated and registered with Delhivery successfully!");
            } else {
              this.snackbar.showSuccess("Warehouse updated locally. Delhivery registration pending (retry from actions).");
            }
            this.loadWarehouses();
            $('#warehouseModal').modal('hide');
            this.saving = false;
          },
          error: (err) => {
            let msg = "Failed to update warehouse";
            if (err.error && typeof err.error === 'object') {
              msg = err.error.message || err.error.error || msg;
            } else if (err.error && typeof err.error === 'string') {
              msg = err.error;
            }
            this.snackbar.showError(msg);
            this.saving = false;
          }
        });
    }
  }

  registerWarehouse(id: number) {
    this.loading = true;
    this.http.post<any>(`${this.apiUrl}/api/Delhivery/warehouses/register/${id}`, {})
      .subscribe({
        next: (res) => {
          this.snackbar.showSuccess(res.message || "Registered successfully with Delhivery.");
          this.loadWarehouses();
        },
        error: (err) => {
          let msg = "Failed to register with Delhivery.";
          if (err.error && typeof err.error === 'object') {
            msg = err.error.message || err.error.error || msg;
          } else if (err.error && typeof err.error === 'string') {
            msg = err.error;
          }
          this.snackbar.showError(msg);
          this.loading = false;
        }
      });
  }

  deleteWarehouse(id: number) {
    if (confirm("Are you sure you want to delete this warehouse?")) {
      this.http.delete<any>(`${this.apiUrl}/api/Delhivery/warehouses/${id}`)
        .subscribe({
          next: (res) => {
            this.snackbar.showSuccess("Warehouse deleted successfully.");
            this.loadWarehouses();
          },
          error: (err) => {
            this.snackbar.showError("Failed to delete warehouse.");
          }
        });
    }
  }
}
