import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Blog } from '../../../models/blog.model';
import { environment } from '../../../../environments/environment';
import { IBlogService } from '../../../services/iblog.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent implements OnInit {

  blogs: Blog[] = [];
  blog: Blog = new Blog();
  blogId: number = 0;
  LatestBlog: Blog = new Blog();
  attachmentUrl = environment.serverHostAddress;
  safeBlogContent!: SafeHtml;

  constructor(
    private iblogService: IBlogService,
    private route: ActivatedRoute,
    private router: Router,
    private elRef: ElementRef,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.blogId = +this.route.snapshot.paramMap.get('id')!;
    this.getBlog(this.blogId);
    this.getBlogs();
  }

  getBlogs(): void {
    this.iblogService.getBlogs().subscribe(res => {
      this.blogs = res;
      this.LatestBlog = this.blogs[0];
    });
  }

  navigateTo(blogId: number): void {
    this.blogId = blogId;
    this.getBlog(blogId);

  }

  get suggestedBlogs() {
    return this.blogs.filter(b => b.b_id !== this.blogId).slice(0, 5);
  }
  getBlog(blogId:number) {
    this.iblogService.getBlog(blogId).subscribe(
      (data: Blog) => {
        this.blog = data;

        // ✅ sanitize HTML content
        this.safeBlogContent =
          this.sanitizer.bypassSecurityTrustHtml(this.blog.b_content);
      },
      (error: any) => { }
    );
  }
}
