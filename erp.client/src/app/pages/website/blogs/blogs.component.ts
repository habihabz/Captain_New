import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent implements OnInit {
  constructor(
    private router: Router,
    private elRef: ElementRef,
  ) 
  {

  }
  ngOnInit(): void {

  }

  navigateTo(blogId: number): void {
    this.router.navigate(['/blog', blogId]);
  }
}
