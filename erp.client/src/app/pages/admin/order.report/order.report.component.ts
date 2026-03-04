import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportParm } from '../../../models/report.parms.model';
import { User } from '../../../models/user.model';
import { MasterData } from '../../../models/master.data.model';
import { ColDef, DomLayoutType, GridApi, GridReadyEvent, RowClassParams, RowStyle } from 'ag-grid-community';
import { RequestParms } from '../../../models/requestParms';
import { IuserService } from '../../../services/iuser.service';
import { Router } from '@angular/router';
import { SnackBarService } from '../../../services/isnackbar.service';
import { IMasterDataService } from '../../../services/imaster.data.service';
import { GridService } from '../../../services/igrid.service';
import { DataTableStructure } from '../../../methods/datatable.structure';
import { IReportService } from '../../../services/ireport.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ActionRendererComponent } from '../../../directives/action.renderer';
import { CustomerOrderStatus } from '../../../models/customer.order.status.model';
import { ICustomerOrderStatusService } from '../../../services/icustomer.order.status.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormControl, FormGroup } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-order.report',
  providers: [provideNativeDateAdapter()],
  templateUrl: './order.report.component.html',
  styleUrl: './order.report.component.css'
})
export class OrderReportComponent implements OnInit {
  pageLink: string = 'order-report';
  reportParms: ReportParm = new ReportParm();
  currentUser: User = new User();
  reportdata: any[] = [];
  orderDetails: any[] = [];
  categories: MasterData[] = [];
  customerOrderStatuses: CustomerOrderStatus[] = [];
  pagination = true;
  paginationPageSize15 = 15;
  paginationPageSizeSelector15 = [15, 30, 50, 100];
  paginationPageSize10 = 10;
  paginationPageSizeSelector10 = [10, 20, 50, 100];
  domLayout: DomLayoutType = 'autoHeight';
  requestParms: RequestParms = new RequestParms();
  pinnedBottomRowData: any[] = [];
  gridApi!: GridApi;
  dateRangeForm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });


  constructor(
    private iuserService: IuserService,
    private router: Router,
    private dataTableStructure: DataTableStructure,
    private snackBarService: SnackBarService,
    private imasterDataService: IMasterDataService,
    private icustomerOrderStatus: ICustomerOrderStatusService,
    private igridService: GridService,
    private ireportService: IReportService
  ) {
    this.currentUser = iuserService.getCurrentUser();
    if (this.currentUser.u_id === 0) {
      this.router.navigate(['login']);
    }
  }
  ngOnInit(): void {
    this.getCustomerOrderStatuses();
    this.getMasterDatasByType("Category", (data) => { this.categories = data; });
   

  }

  @ViewChild('reportGrid') reportGrid!: AgGridAngular;
  @ViewChild('detailsGrid') detailsGrid!: AgGridAngular;

  frameworkComponents = {
    actionRenderer: ActionRendererComponent
  };
  defaultColDef = {
    sortable: true,
    filter: true
  };

  colDefs: ColDef[] = [
  ];

  detailColDefs: ColDef[] = [];

  onAction(action: string, data: any) {
    switch (action) {

      case 'details':
        break;
      default:
        this.snackBarService.showError("Unknown Action " + action);
    }
  }


  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    setTimeout(() => {
      this.igridService.resizeGridColumns(this.reportGrid.api);
    }, 500);
    this.updateTotalRow();

  }

  getCustomerOrderStatuses() {
    this.icustomerOrderStatus.getCustomerOrderStatuses().subscribe(
      (data: CustomerOrderStatus[]) => {
        this.customerOrderStatuses = data;
      },
      (error: any) => {

      }
    );
  }

  getMasterDatasByType(masterType: string, callback: (data: MasterData[]) => void): void {
    this.requestParms = new RequestParms();
    this.requestParms.type = masterType;
    this.imasterDataService.getMasterDatasByType(this.requestParms).subscribe(
      (data: MasterData[]) => {
        callback(data);
      },
      (error: any) => {
        callback([]);
      }
    );
  }

  getOrderReport() {
    if (this.reportParms.rp_report_type != "") {

      const start = this.dateRangeForm.get('start')?.value;
      const end = this.dateRangeForm.get('end')?.value;
      if (start && end) {
        this.reportParms.rp_date_range = start.toLocaleDateString('en-CA') + "," + end.toLocaleDateString('en-CA');
      }
      this.ireportService.getOrderReport(this.reportParms).subscribe(
        (data: any[]) => {

          this.colDefs = this.dataTableStructure.getDatatableStructure(data);
          this.reportdata = data;
          setTimeout(() => {
            this.reportGrid.api.autoSizeAllColumns();
          }, 100);
        },
        (error: any) => {
          this.snackBarService.showError("Error Fetching Report");
        }
      );
    }
    else {
      this.snackBarService.showError("Please Select Report Type");

    }
  }

  onFilterChanged() {
    this.updateTotalRow();
  }

  updateTotalRow() {
    if (!this.gridApi) return;

    // Get visible (filtered) rows
    const filteredData: any[] = [];
    this.gridApi.forEachNodeAfterFilter((node) => {
      if (node.data) filteredData.push(node.data);
    });

    // Recalculate totals for visible rows
    this.pinnedBottomRowData = [this.dataTableStructure.getTotalRowData(filteredData)];
  }

  onOrderStatusChange(id: any) {
    this.reportParms.rp_order_status = id;
  
  }

  OnReportTypeChange(reporttype: any) {
    this.reportParms.rp_report_type = reporttype
  }

  getRowStyleScheduled(params: RowClassParams<any, any>): RowStyle | undefined {
    if (params.data) {
      if (params.data["Order"] === 'Total') {
        return {
          'background-color': '#669999',
          'color': '#fff'
        };
      } else {
        return undefined
      }
    }
    return undefined;
  }
  onExport() {
    if (this.reportGrid.api) {
      this.reportGrid.api.exportDataAsCsv
        ({
          fileName: 'order-reports.csv',
        });
    } else {
      this.snackBarService.showError("Grid Not Found");
    }
  }
  onExportDetail() {
    if (this.detailsGrid.api) {
      this.detailsGrid.api.exportDataAsCsv
        ({
          fileName: 'order-details.csv',
        });
    } else {
      this.snackBarService.showError("Grid Not Found");
    }
  }
}
