import { Component, OnInit, ViewChild } from '@angular/core';
import { StatusService } from '../../services/status.service';
import { Status } from '../../models/status.model';
import { User } from '../../models/user.model';
import { IuserService } from '../../services/iuser.service';
import { SnackBarService } from '../../services/isnackbar.service';
import { DbResult } from '../../models/dbresult.model';
import { ColDef, DomLayoutType } from 'ag-grid-community';
import { ActionRendererComponent } from '../../directives/action.renderer';
import { AgGridAngular } from 'ag-grid-angular';

declare var $: any;

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {
  statuses: Status[] = [];
  allStatuses: Status[] = [];
  status: Status = new Status();
  currentUser: User = new User();
  pagination = true;
  domLayout: DomLayoutType = 'autoHeight';
  selectedWorkflow: number = 0;

  @ViewChild('statusGrid') statusGrid!: AgGridAngular;

  colDefs: ColDef[] = [
    {
      headerName: "ID",
      field: "s_id",
      width: 80,
      cellClass: 'fw-bold text-muted border-end-0',
      headerClass: 'ps-3'
    },
    {
      headerName: 'Status Name',
      field: 's_name',
      flex: 2,
      cellClass: 'fw-bold text-dark border-end-0'
    },
    {
      headerName: "Workflow Context",
      field: "s_workflow_id",
      flex: 3,
      cellClass: 'text-muted border-end-0',
      valueFormatter: (params: any) => {
        return params.value == 1 ? 'ORDER PROCESSING' : 'RETURNS MANAGEMENT';
      }
    },
    {
      headerName: "Audit Trail",
      field: "s_cre_by_name",
      flex: 1.2,
      cellClass: 'text-muted small',
      valueGetter: p => `${p.data.s_cre_by_name || 'System'}`
    },
    {
      headerName: "Created On",
      field: "s_cre_date",
      width: 140,
      valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
    },
    {
      headerName: 'Actions',
      width: 120,
      pinned: 'right',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        actions: [
          {
            tooltip: 'Edit Status',
            cssClass: 'action-btn btn-edit',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.editStatus(data.s_id)
          },
          {
            tooltip: 'Delete Status',
            cssClass: 'action-btn btn-delete',
            icon: 'fa fa-trash-o',
            action: 'onDelete',
            onDelete: (data: any) => this.deleteStatus(data.s_id)
          }
        ]
      }
    }
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  frameworkComponents = {
    actionRenderer: ActionRendererComponent
  };

  onGridReady(event: any) {
    setTimeout(() => {
      event.api.sizeColumnsToFit();
    }, 500);
  }

  constructor(
    private statusService: StatusService,
    private iuser: IuserService,
    private snackBarService: SnackBarService
  ) {
    this.currentUser = iuser.getCurrentUser();
  }

  ngOnInit(): void {

    this.statusService.refresh$.subscribe(() => {
      this.getStatuses();
    });
  }

  getStatuses() {

    this.statusService.getStatuses(this.selectedWorkflow).subscribe((data: Status[]) => {
      this.allStatuses = data;
      this.applyFilter();
    });
  }

  onWorkflowFilterChange(workflowId: any) {
    this.getStatuses();
    this.selectedWorkflow = Number(workflowId);

    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedWorkflow === 0) {
      this.statuses = this.allStatuses;
    } else {
      this.statuses = this.allStatuses.filter(x => x.s_workflow_id === this.selectedWorkflow);
    }
  }

  createStatus() {
    this.status = new Status();
    this.status.s_cre_by = this.currentUser.u_id;
    $("#statusFormModal").modal("show");
  }

  editStatus(id: number) {
    this.statusService.getStatus(id).subscribe((data: Status) => {
      this.status = data;
      $("#statusFormModal").modal("show");
    });
  }

  deleteStatus(id: number) {
    this.status.s_id = id;
    $('#confirmDeleteModal').modal('show');
  }

  onDeleteConfirmed() {
    if (this.status.s_id) {
      this.statusService.deleteStatus(this.status.s_id).subscribe((data: DbResult) => {
        if (data.message === "Success") {
          this.snackBarService.showSuccess("Status deleted successfully.");
          this.statusService.refresh();
          $('#confirmDeleteModal').modal('hide');
        } else {
          this.snackBarService.showError(data.message);
        }
      });
    }
  }

  createOrUpdateStatus() {
    this.status.s_cre_by = this.currentUser.u_id;
    this.statusService.createOrUpdateStatus(this.status).subscribe((data: DbResult) => {
      if (data.message === "Success") {
        this.snackBarService.showSuccess(this.status.s_id ? "Status updated successfully." : "Status created successfully.");
        $("#statusFormModal").modal("hide");
        this.statusService.refresh();
      } else {
        this.snackBarService.showError(data.message);
      }
    });
  }
}
