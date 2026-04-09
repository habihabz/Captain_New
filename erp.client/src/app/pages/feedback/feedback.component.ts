import { Component, ViewChild, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { IuserService } from '../../services/iuser.service';
import { IFeedbackService } from '../../services/ifeedback.service';
import { Router } from '@angular/router';
import { SnackBarService } from '../../services/isnackbar.service';
import { GridService } from '../../services/igrid.service';
import { User } from '../../models/user.model';
import { DbResult } from '../../models/dbresult.model';
import { ActionRendererComponent } from '../../directives/action.renderer';
import { Feedback } from '../../models/feedback.model';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css'
})
export class FeedbackComponent implements OnInit {
  pagination = true;
  paginationPageSize = 15;
  paginationPageSizeSelector = [15, 30, 50, 100];
  currentUser: User = new User();
  dbResult: DbResult = new DbResult();
  feedback: Feedback = new Feedback();
  feedbacks: Feedback[] = [];
  private subscription: Subscription = new Subscription();

  @ViewChild('feedbackGrid') feedbackGrid!: AgGridAngular;

  currentTab: 'active' | 'closed' = 'active';
  dateRange = { start: '', end: '' };

  constructor(
    private iuserService: IuserService,
    private iFeedBackService: IFeedbackService,
    private router: Router,
    private gridService: GridService,
    private snackBarService: SnackBarService
  ) {
    this.currentUser = iuserService.getCurrentUser();
    if (this.currentUser.u_id === 0) {
      this.router.navigate(['login']);
    }
  }

  colDefs: ColDef[] = [
    { headerName: "Id", field: "f_id", width: 80 },
    { headerName: "First Name", field: "f_first_name" },
    { headerName: "Last Name", field: "f_last_name" },
    { headerName: "Email", field: "f_email" },
    { headerName: "Phone", field: "f_phone" },
    { headerName: "Message", field: "f_message", flex: 1 },
    { headerName: "Created On", field: "f_created_on", width: 140 },
    {
      headerName: 'Edit', cellRenderer: 'actionRenderer', cellRendererParams:
      {
        name: 'Edit', action: 'onEdit', cssClass: 'btn btn-info', icon: 'fa fa-edit', onEdit: (data: any) => this.onAction('edit', data)
      },
    },
    {
      headerName: 'Delete', cellRenderer: 'actionRenderer', cellRendererParams:
      {
        name: 'Delete', action: 'onDelete', cssClass: 'btn btn-danger', icon: 'fa fa-trash', onDelete: (data: any) => this.onAction('delete', data)
      },
    }
  ];

  frameworkComponents = {
    actionRenderer: ActionRendererComponent
  };
  defaultColDef = {
    sortable: true,
    filter: true
  };

  onAction(action: string, data: any) {
    switch (action) {
      case 'delete':
        this.onDelete(data);
        break;
      default:
        this.snackBarService.showError("Unknown Action " + action);
    }
  }

  onQuickFilterChanged(value: any) {
    this.feedbackGrid.api.setGridOption('quickFilterText', value.target.value);
  }

  onClose() {
    this.router.navigate(['home']);
  }

  setTab(tab: 'active' | 'closed') {
    this.currentTab = tab;
    this.getFeedbacks();
  }

  onDateFilter() {
    this.getFeedbacks();
  }

  onGridReady(event: GridReadyEvent) {
    setTimeout(() => {
      this.gridService.resizeGridColumns(this.feedbackGrid.api);
    }, 200);
  }

  ngOnInit(): void {
    this.getFeedbacks();
    this.subscription.add(
      this.iFeedBackService.refreshFeedbacks$.subscribe(() => {
        this.getFeedbacks();
      })
    );
  }

  onDelete(data: any) {
    this.iFeedBackService.deleteFeedback(data.f_id).subscribe(
      (result: DbResult) => {
        if (result.message === "Success") {
          this.feedbacks = this.feedbacks.filter(feedback => feedback.f_id !== data.f_id);
          this.snackBarService.showSuccess("Message removed successfully.");
        } else {
          this.snackBarService.showError(result.message);
        }
      }
    );
  }

  getFeedbacks() {
    this.iFeedBackService.getFeedbacks().subscribe(
      (data: Feedback[]) => {
        this.feedbacks = data;
      }
    );
  }
}
