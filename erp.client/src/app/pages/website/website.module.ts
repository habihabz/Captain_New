import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material Modules
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Website Components
import { SitelayoutComponent } from './sitelayout/sitelayout.component';
import { WebsiteTopComponent } from './sitelayout/website-top/website-top.component';
import { WebsiteFooterComponent } from './sitelayout/website-footer/website-footer.component';
import { WebHomeComponent } from './web.home/web.home.component';
import { SingleProductComponent } from './single-product/single-product.component';
import { ContactUsComponent } from './contact.us/contact.us.component';
import { BlogsComponent } from './blogs/blogs.component';
import { ShopComponent } from './shop/shop.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { MycartComponent } from './mycart/mycart.component';
import { FavouriteComponent } from './favourite/favourite.component';
import { MyOrdersComponent } from './my.orders/my.orders.component';
import { AboutUsComponent } from './about.us/about.us.component';
import { OrderDetailsComponent } from './order.details/order.details.component';
import { PaymentFailureComponent } from './payment.failure/payment.failure.component';
import { PaymentSuccessComponent } from './payment.success/payment.success.component';
import { PaymentComponent } from './payment/payment.component';
import { SitemapComponent } from './sitemap/sitemap.component';

@NgModule({
  declarations: [
    SitelayoutComponent,
    WebsiteTopComponent,
    WebsiteFooterComponent,
    WebHomeComponent,
    SingleProductComponent,
    ContactUsComponent,
    BlogsComponent,
    ShopComponent,
    UserRegistrationComponent,
    MycartComponent,
    FavouriteComponent,
    MyOrdersComponent,
    AboutUsComponent,
    OrderDetailsComponent,
    PaymentFailureComponent,
    PaymentSuccessComponent,
    PaymentComponent,
    SitemapComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatSidenavModule,
    MatTabsModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  exports: [
    SitelayoutComponent,
    WebsiteTopComponent,
    WebsiteFooterComponent,
    WebHomeComponent,
    SingleProductComponent,
    ContactUsComponent,
    BlogsComponent,
    ShopComponent,
    UserRegistrationComponent,
    MycartComponent,
    FavouriteComponent,
    MyOrdersComponent,
    AboutUsComponent,
    OrderDetailsComponent,
    PaymentFailureComponent,
    PaymentSuccessComponent,
    PaymentComponent
  ]
})
export class WebsiteModule { }
