import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-sitemap',
  template: `
    <div class="container-fluid py-0">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb bg-light px-3 py-2 rounded">
          <li class="breadcrumb-item"><a routerLink="/web-home">Home</a></li>
          <li class="breadcrumb-item active" aria-current="page">Sitemap</li>
        </ol>
      </nav>

      <div class="container py-5">
        <h1 class="mb-5 fw-bold text-dark">Site Map</h1>

        <div class="row g-5">
          <div class="col-md-4">
            <h4 class="fw-bold mb-4 border-bottom pb-2 text-teal">Main Pages</h4>
            <ul class="list-unstyled">
              <li class="mb-3"><a routerLink="/web-home" class="text-decoration-none text-muted hover-teal">Home Page</a></li>
              <li class="mb-3"><a routerLink="/shop" class="text-decoration-none text-muted hover-teal">Shop & Products</a></li>
              <li class="mb-3"><a routerLink="/about-us" class="text-decoration-none text-muted hover-teal">About Captain</a></li>
              <li class="mb-3"><a routerLink="/contact-us" class="text-decoration-none text-muted hover-teal">Contact & Support</a></li>
              <li class="mb-3"><a routerLink="/blog" class="text-decoration-none text-muted hover-teal">Latest Blogs</a></li>
            </ul>
          </div>

          <div class="col-md-4">
            <h4 class="fw-bold mb-4 border-bottom pb-2 text-teal">Customer Area</h4>
            <ul class="list-unstyled">
              <li class="mb-3"><a routerLink="/my-cart" class="text-decoration-none text-muted hover-teal">Shopping Cart</a></li>
              <li class="mb-3"><a routerLink="/favourites" class="text-decoration-none text-muted hover-teal">Wishlist</a></li>
              <li class="mb-3"><a routerLink="/myorders" class="text-decoration-none text-muted hover-teal">My Orders</a></li>
              <li class="mb-3"><a routerLink="/user-registration" class="text-decoration-none text-muted hover-teal">Create Account</a></li>
              <li class="mb-3"><a routerLink="/login" class="text-decoration-none text-muted hover-teal">Login</a></li>
            </ul>
          </div>

          <div class="col-md-4">
            <h4 class="fw-bold mb-4 border-bottom pb-2 text-teal">Information</h4>
            <ul class="list-unstyled">
              <li class="mb-3"><a routerLink="/shop" class="text-decoration-none text-muted hover-teal">Delivery Information</a></li>
              <li class="mb-3"><a routerLink="/shop" class="text-decoration-none text-muted hover-teal">Privacy Policy</a></li>
              <li class="mb-3"><a routerLink="/shop" class="text-decoration-none text-muted hover-teal">Terms & Conditions</a></li>
              <li class="mb-3"><a routerLink="/shop" class="text-decoration-none text-muted hover-teal">Returns & Refunds</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-teal { color: #1abb9c; }
    .hover-teal:hover { 
      color: #1abb9c !important; 
      padding-left: 5px;
      transition: all 0.3s ease;
    }
    .breadcrumb-item a { color: #1abb9c; text-decoration: none; }
  `]
})
export class SitemapComponent implements OnInit {
  constructor(private titleService: Title, private metaService: Meta) { }

  ngOnInit(): void {
    this.titleService.setTitle('Sitemap - Captain Website Structure');
    this.metaService.updateTag({ name: 'description', content: 'Easy navigation for the Captain website. Find products, categories, account details, and support information all in one place.' });
  }
}
