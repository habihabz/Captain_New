import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { IuserService } from '../../services/iuser.service';
import { DbResult } from '../../models/dbresult.model';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { ICategoryService } from '../../services/icategory.service';
import { Category } from '../../models/category.model';

declare var $: any;

import { ColDef, DomLayoutType } from 'ag-grid-community';
import { ActionRendererComponent } from '../../directives/action.renderer';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  category: Category = new Category();
  currentUser: User = new User();
  dbResult: DbResult = new DbResult();
  private subscription: Subscription = new Subscription();
  
  pagination = true;
  domLayout: DomLayoutType = 'autoHeight';

  colDefs: ColDef[] = [
    { 
      headerName: "ID", 
      field: "ct_id", 
      width: 70, 
      cellClass: 'text-center fw-bold text-muted'
    },
    { 
      headerName: "Category Name", 
      field: "ct_name", 
      flex: 1.2,
      cellClass: 'fw-bold text-dark'
    },
    { 
      headerName: "Description", 
      field: "ct_description", 
      flex: 1.5,
      cellClass: 'text-muted small'
    },
    { 
      headerName: "Active", 
      field: "ct_active_yn", 
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
            tooltip: 'Edit Category',
            cssClass: 'btn btn-outline-info btn-xs rounded-pill me-1',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.editCategory(data.ct_id)
          },
          {
            name: '',
            tooltip: 'Delete Category',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash',
            action: 'onDelete',
            onDelete: (data: any) => this.deleteCategory(data.ct_id)
          }
        ]
      }
    },
    { 
        headerName: "Created On", 
        field: "ct_cre_date", 
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

  constructor(private iuserService: IuserService, private icategoryService: ICategoryService, private router: Router) { 
    this.currentUser = iuserService.getCurrentUser();
    if(this.currentUser.u_id == 0) { 
      this.router.navigate(['login']);
    }
  }

  ngOnInit(): void {
    this.loadCategories();
    this.subscription.add(
      this.icategoryService.refreshCategories$.subscribe(() => {
        this.loadCategories();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCategories(): void {
    this.icategoryService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data;
      },
      (error: any) => {
        console.error('Error fetching categories', error);
      }
    );
  }

  onGridReady(params: any) {
    params.api.sizeColumnsToFit();
  }

  createOrUpdateCategory(): void {
    this.category.ct_cre_by = this.currentUser.u_id;
    this.icategoryService.createOrUpdateCategory(this.category).subscribe(
      (data: DbResult) => {
        if (data.message === "Success") {
          this.icategoryService.refreshCategories();
          $('#categoryFormModal').modal('hide');
        } else {
          alert(data.message);
        }
      }
    );
  }

  deleteCategory(id: number): void {
    if(confirm("Are you sure you want to delete this category?")) {
      this.icategoryService.deleteCategory(id).subscribe(
        (data: DbResult) => {
          if (data.message === "Success") {
            this.icategoryService.refreshCategories();
          } else {
            alert(data.message);
          }
        }
      );
    }
  }

  editCategory(id: number): void {
    this.icategoryService.getCategory(id).subscribe(
      (data: Category) => {
        this.category = data;
        $('#categoryFormModal').modal('show');
      }
    );
  }

  createCategory(): void {
    this.category = new Category();
    $('#categoryFormModal').modal('show');
  }
}
