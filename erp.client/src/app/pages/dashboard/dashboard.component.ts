import { Component, OnInit } from '@angular/core';
import { ICustomerOrder } from '../../services/icustomer.order.service';
import { RequestParms } from '../../models/requestParms';
import { IProductService } from '../../services/iproduct.service';
import { IuserService } from '../../services/iuser.service';
import { IConstantValueService } from '../../services/iconstant.values.service';
import { IReportService } from '../../services/ireport.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats = {
    totalSales: 0,
    totalOrders: 0,
    activeCustomers: 0,
    activeProducts: 0,
    pendingShipments: 0,
    newCustomers: 0,
    monthlyOrders: 0,
    lowStock: 0
  };
  
  currencySymbol: string = '₹'; // Default fallback

  recentOrders: any[] = [];
  topProducts: any[] = [
    { name: 'Classic Leather Watch', sales: 142, revenue: 14200, growth: 12 },
    { name: 'Premium Silk Scarf', sales: 98, revenue: 4900, growth: 8 },
    { name: 'Minimalist Card Holder', sales: 85, revenue: 2550, growth: -2 },
    { name: 'Signature Fragrance', sales: 74, revenue: 7400, growth: 15 }
  ];

  constructor(
    private orderService: ICustomerOrder,
    private productService: IProductService,
    private userService: IuserService,
    private constantService: IConstantValueService,
    private reportService: IReportService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const params = new RequestParms();
    params.completedYn = ''; // Get all orders, not just active ones
    params.startDate = '';
    params.endDate = '';
    
    // Fetch genuine data from DB procedure and other sources
    forkJoin({
      stats: this.reportService.getDashboardStats(),
      orders: this.orderService.getCustomerOrders(params),
      currency: this.constantService.getConstantValueByName('Default Currency')
    }).subscribe({
      next: (data) => {
        this.recentOrders = data.orders.slice(0, 5);
        
        if (data.currency) {
          this.currencySymbol = data.currency.cv_value || '₹';
        }

        // Use stats from procedure with defensive logging
        if (data.stats) {
          console.log('Genuine Stats Received:', data.stats);
          const s = data.stats;
          this.stats.totalOrders = s.totalOrders || 0;
          this.stats.totalSales = s.totalSales || 0;
          this.stats.activeProducts = s.activeProducts || 0;
          this.stats.activeCustomers = s.activeCustomers || 0;
          this.stats.pendingShipments = s.pendingShipments || 0;
          this.stats.newCustomers = s.newCustomersWeek || 0;
          this.stats.monthlyOrders = s.monthlyOrders || 0;
          
          console.log('Applied Stats:', this.stats);
        }

        // Realistic top products based on actual orders
        this.calculateTopProducts(data.orders);
      },
      error: (err) => console.error('Error loading dashboard data', err)
    });
  }

  calculateTopProducts(orders: any[]) {
    const productSales: any = {};
    orders.forEach(order => {
      if (order.co_product_name) {
        if (!productSales[order.co_product_name]) {
          productSales[order.co_product_name] = { name: order.co_product_name, sales: 0, revenue: 0, growth: 5 };
        }
        productSales[order.co_product_name].sales += 1;
        productSales[order.co_product_name].revenue += (order.co_net_amount || 0);
      }
    });

    const sortedProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 4);

    if (sortedProducts.length > 0) {
      this.topProducts = sortedProducts;
    }
  }
}
