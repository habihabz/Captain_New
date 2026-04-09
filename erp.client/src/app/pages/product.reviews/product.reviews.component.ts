import { Component, OnInit } from '@angular/core';
import { IProductReviewService } from '../../services/iproduct.review.service';
import { ProductReview } from '../../models/product.review.model';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { SnackBarService } from '../../services/isnackbar.service';
declare var Swal: any;

@Component({
  selector: 'app-product.reviews',
  templateUrl: './product.reviews.component.html',
  styleUrl: './product.reviews.component.css'
})
export class ProductReviewsComponent implements OnInit {
  breadcrumbItems = [
    { label: 'Admin Console', link: '/dashboard' },
    { label: 'Product Reviews', active: true }
  ];

  reviews: ProductReview[] = [];
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'pr_id', width: 90, sortable: true, filter: true },
    { headerName: 'Product', field: 'p_name', width: 200, sortable: true, filter: true },
    { headerName: 'Reviewer', field: 'pr_cre_by_name', width: 180, sortable: true, filter: true },
    { 
      headerName: 'Rating', 
      field: 'pr_overall_rating', 
      width: 120,
      cellRenderer: (p: any) => {
        let stars = '';
        for (let i = 0; i < 5; i++) {
          stars += `<i class="fa fa-star ${i < p.value ? 'text-warning' : 'text-muted'}" style="font-size: 12px;"></i>`;
        }
        return `<span>${stars}</span>`;
      }
    },
    { headerName: 'Headline', field: 'pr_head_line', width: 250, sortable: true, filter: true },
    { headerName: 'Date', field: 'pr_created_on', width: 150, valueFormatter: (p: any) => new Date(p.value).toLocaleDateString() },
    {
      headerName: 'Actions',
      field: 'pr_id',
      width: 100,
      pinned: 'right',
      cellRenderer: (p: any) => {
        return `<button class="btn btn-sm btn-outline-danger border-0 p-1" title="Delete Review">
                  <i class="fa fa-trash-o fs-6"></i>
                </button>`;
      },
      onCellClicked: (p: any) => this.onDelete(p.data)
    }
  ];

  constructor(
    private reviewService: IProductReviewService,
    private snackbarService: SnackBarService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    // Passing 0 to get all reviews
    this.reviewService.getProductReviews(0).subscribe(
      (data: ProductReview[]) => {
        this.reviews = data;
      },
      (error: any) => {
        this.snackbarService.showError('Failed to load reviews');
      }
    );
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  onQuickFilterChanged(event: any): void {
    this.gridApi.setGridOption('quickFilterText', event.target.value);
  }

  onDelete(review: ProductReview): void {
    Swal.fire({
      title: 'Delete Review?',
      text: `Are you sure you want to delete the review by ${review.pr_cre_by_name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1abb9c',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.reviewService.deleteProductReview(review.pr_id).subscribe(
          (res: any) => {
            if (res.message === 'Success') {
              this.snackbarService.showSuccess('Review deleted successfully');
              this.loadReviews();
            } else {
              this.snackbarService.showError(res.message);
            }
          }
        );
      }
    });
  }
}
