import { Component, ElementRef, ViewChild } from '@angular/core';
import { ColDef, DomLayoutType, GridReadyEvent } from 'ag-grid-community';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { DbResult } from '../../models/dbresult.model';
import { CustomerOrder } from '../../models/customer.order.model';
import { Router } from '@angular/router';
import { IProductService } from '../../services/iproduct.service';
import { SnackBarService } from '../../services/isnackbar.service';
import { ICartService } from '../../services/icart.service';
import { IuserService } from '../../services/iuser.service';
import { GeolocationService } from '../../services/GeoCurrentLocation.service';
import { Customer } from '../../models/customer.model';
import { ICustomerOrder } from '../../services/icustomer.order.service';
import { RequestParms } from '../../models/requestParms';
import { ActionRendererComponent } from '../../directives/action.renderer';
import { GridService } from '../../services/igrid.service';
import { AgGridAngular } from 'ag-grid-angular';
import { CustomerOrderDetail } from '../../models/customer.order.detail.model';
import { ICustomerOrderStatusService } from '../../services/icustomer.order.status.service';
import { CustomerOrderStatus } from '../../models/customer.order.status.model';
import { Slider } from '../../models/slider.model';
import { ISliderService } from '../../services/islider.service';
import { environment } from '../../../environments/environment';
declare var $: any;



@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent {
  attachmentUrl = `${environment.serverHostAddress}`;
  pagination = true;
  paginationPageSize15 = 15;
  paginationPageSizeSelector15 = [15, 30, 50, 100];
  paginationPageSize10 = 10;
  paginationPageSizeSelector10 = [10, 20, 50, 100];
  domLayout: DomLayoutType = 'autoHeight';
  sliders: Slider[] = [];
  slider: Slider = new Slider();
  selectedFile: File | null = null;
  currentUser: User = new User();
  subscription: Subscription = new Subscription();
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private isliderService: ISliderService,
    private snack: SnackBarService,
    private iuserService: IuserService,
    private router: Router
  ) {
    this.currentUser = iuserService.getCurrentUser();

    if (this.currentUser.u_id == 0) {
      this.router.navigate(['login']);
    }

  }

  ngOnInit(): void {
    this.getSliders();
    this.subscription.add(
      this.isliderService.refreshSliders$.subscribe(() => {
        this.getSliders();
      })
    );
  }
  colDefs: ColDef[] = [
    { headerName: "ID", field: "s_id", width: 80 },
    { headerName: "Title", field: "s_title" },
    {
      headerName: "Image",
      field: "s_image_url",
      cellRenderer: (params: any) =>
        `<img src="${this.attachmentUrl + '/' + params.value}" width="60" height="40" style="object-fit:cover;">`
    },
    {
      headerName: "Active",
      field: "s_active",
      cellRenderer: (p: any) => (p.value ? "Yes" : "No")
    },
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
    }];

  frameworkComponents = {
    actionRenderer: ActionRendererComponent
  };
  defaultColDef = {
    sortable: true,
    filter: true
  };

  onAction(action: string, data: any) {
    switch (action) {
      case 'edit':
        this.onEdit(data);
        break;
      case 'delete':
        this.onDelete(data);
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  }

  getSliders() {
    this.isliderService.getSliders().subscribe(res => {
      this.sliders = res;
    });
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  openCreateModal() {
    this.slider = new Slider();
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = "";
    }
    $("#sliderModal").modal("show");
  }


  onEdit(row: Slider) {
    this.slider = { ...row };
    this.selectedFile = null;
    $("#sliderModal").modal("show");
  }

  onDelete(data: any) {
    this.isliderService.deleteSlider(data.s_id).subscribe(
      (result: DbResult) => {
        if (result.message === 'Success') {
          this.sliders = this.sliders.filter(slider => slider.s_id !== slider.s_id);
          this.isliderService.refreshSliders();
          this.snack.showError("Successfully Deleted!!");
        } else {
          this.snack.showError(result.message);
        }
      },
      (error: any) => {
        console.error('Error deleting user', error);
      }
    );
  }


  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  createOrUpdateSlider() {
    const form = new FormData();
    form.append("s_id", this.slider.s_id.toString());
    form.append("s_title", this.slider.s_title);
    form.append("s_active_yn", this.slider.s_active_yn); // Y / N
    form.append("s_cre_by", this.currentUser.u_id.toString());
    if (this.selectedFile) {
      form.append("image", this.selectedFile);
    }

    this.isliderService.createOrUpdateSlider(form).subscribe((res) => {

      if (res.message === "Success") {
        this.snack.showSuccess(
          this.slider.s_id === 0 ? "Created!" : "Updated!"
        );
      } else {
        this.snack.showError(res.message);
        return;
      }

      $("#sliderModal").modal("hide");
      this.getSliders();
      this.slider = new Slider();
      this.selectedFile = null;
    });
  }

}