import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sitelayout',
  templateUrl: './sitelayout.component.html',
  styleUrl: './sitelayout.component.css'
})
export class SitelayoutComponent {
  constructor(private router: Router) {}

  isHomePage(): boolean {
    return this.router.url.includes('web-home') || this.router.url === '/';
  }
}

