import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DbResult } from '../../models/dbresult.model';
import { User } from '../../models/user.model';
import { MasterData } from '../../models/master.data.model';
import { IuserService } from '../../services/iuser.service';
import { Router } from '@angular/router';
import { IMasterDataService } from '../../services/imaster.data.service';
import { MasterType } from '../../models/master.type.model';
import { RequestParms } from '../../models/requestParms';
import { ColDef, DomLayoutType } from 'ag-grid-community';
import { ActionRendererComponent } from '../../directives/action.renderer';
declare var $: any;


@Component({
  selector: 'app-master-data',
  templateUrl: './master-data.component.html',
  styleUrl: './master-data.component.css'
})
export class MasterDataComponent implements OnInit, OnDestroy {
  masterDatas: MasterData[] = [];
  masterData: MasterData = new MasterData();
  masterTypes: MasterType[] = [];
  masterType: string = "";
  requestParms: RequestParms = new RequestParms()
  currentUser: User = new User();
  dbResult: DbResult = new DbResult();
  private subscription: Subscription = new Subscription();
  
  pagination = true;
  domLayout: DomLayoutType = 'autoHeight';

  colDefs: ColDef[] = [
    { 
      headerName: "ID", 
      field: "md_id", 
      width: 70, 
      cellClass: 'text-center fw-bold text-muted'
    },
    { 
      headerName: "Value / Name", 
      field: "md_name", 
      flex: 1.5,
      cellClass: 'fw-bold text-dark'
    },
    { 
      headerName: "Type", 
      field: "md_type", 
      width: 150,
      cellRenderer: (p: any) => `<span class="grid-badge bg-light text-muted border shadow-xs">${p.value || ''}</span>`
    },
    { 
      headerName: "Active", 
      field: "md_active_yn", 
      width: 100,
      cellClass: 'text-center',
      cellRenderer: (p: any) => {
        const isActive = p.value === 'Y';
        return `<span class="grid-badge ${isActive ? 'bg-success' : 'bg-danger'} text-white shadow-xs">${isActive ? 'Active' : 'Inactive'}</span>`;
      }
    },
    {
      headerName: 'Actions',
      width: 150,
      pinned: 'right',
      cellClass: 'text-center',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        actions: [
          {
            name: '',
            tooltip: 'Edit Record',
            cssClass: 'btn btn-outline-info btn-xs rounded-pill me-1',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.editMasterData(data.md_id)
          },
          {
            name: '',
            tooltip: 'Delete Record',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash',
            action: 'onDelete',
            onDelete: (data: any) => this.deleteMasterData(data.md_id)
          }
        ]
      }
    },
    { 
        headerName: "Created On", 
        field: "md_cre_date", 
        width: 130, 
        cellClass: 'text-center',
        valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString('en-GB') : ''
    }
  ];

  frameworkComponents = {
    actionRenderer: ActionRendererComponent
  };

  defaultColDef = {
    sortable: true,
    filter: true
  };

  constructor(private iuserService: IuserService, private imasterDataService: IMasterDataService, private router: Router) { 
    this.currentUser = iuserService.getCurrentUser();
    if(this.currentUser.u_id == 0) { 
      this.router.navigate(['login']);
    }
  }

  ngOnInit(): void {
    this.LoadMasterTypes();
    this.subscription.add(
      this.imasterDataService.refreshMasterDatas$.subscribe(() => {
        this.getMasterDatasByType();
      })
    );
  }

  LoadMasterTypes(): void {
    this.imasterDataService.getMasterDataTypes().subscribe(
      (data: MasterType[]) => {
        this.masterTypes = data;
        if (this.masterTypes.length > 0) {
          this.masterType = this.masterTypes[0].type;
          this.getMasterDatasByType();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onGridReady(params: any) {
    params.api.sizeColumnsToFit();
  }

  createOrUpdateMasterData(): void {
    this.masterData.md_cre_by = this.currentUser.u_id;
    this.imasterDataService.createOrUpdateMasterData(this.masterData).subscribe(
      (data: DbResult) => {
        if (data.message === "Success") {
          this.imasterDataService.refreshMasterDatas();
          $('#masterDataFormModal').modal('hide');
        } else {
          alert(data.message);
        }
      }
    );
  }

  deleteMasterData(id: number): void {
    if(confirm("Are you sure you want to delete this master data?")) {
      this.imasterDataService.deleteMasterData(id).subscribe(
        (data: DbResult) => {
          if (data.message === "Success") {
            this.imasterDataService.refreshMasterDatas();
          } else {
            alert(data.message);
          }
        }
      );
    }
  }

  editMasterData(id: number): void {
    this.imasterDataService.getMasterData(id).subscribe(
      (data: MasterData) => {
        this.masterData = data;
        $('#masterDataFormModal').modal('show');
      }
    );
  }

  createMasterData(): void {
    this.masterData = new MasterData();
    this.masterData.md_type = this.masterType;
    $('#masterDataFormModal').modal('show');
  }

  onOptionChange(option: any){
    this.masterType = option;
    this.getMasterDatasByType();
  }

  getMasterDatasByType(): void {
    this.requestParms.type = this.masterType;
    this.imasterDataService.getMasterDatasByType(this.requestParms).subscribe(
      (data: MasterData[]) => {
        this.masterDatas = data;
      }
    );
  }
}

