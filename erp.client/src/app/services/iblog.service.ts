import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Blog } from '../models/blog.model';
import { DbResult } from '../models/dbresult.model';
import { environment } from '../../environments/environment';
import { ILoginService } from './ilogin.service';

@Injectable({
  providedIn: 'root'
})
export class IBlogService {

  private apiUrl = `${environment.serverHostAddress}/api/Blog`;
  private refreshBlogSubject = new Subject<void>();

  constructor(
    private http: HttpClient,
    private iLoginService: ILoginService
  ) {}

  getBlogs(): Observable<Blog[]> {
    return this.http.post<Blog[]>(`${this.apiUrl}/getBlogs`, {});
  }

  getBlog(id: number): Observable<Blog> {
    return this.http.post<Blog>(`${this.apiUrl}/getBlog`, id);
  }

  deleteBlog(id: number): Observable<DbResult> {
    return this.http.post<DbResult>(`${this.apiUrl}/deleteBlog`, id);
  }

  createOrUpdateBlog(formData: FormData): Observable<DbResult> {
    return this.http.post<DbResult>(`${this.apiUrl}/createOrUpdateBlog`, formData);
  }

  get refreshBlogs$() {
    return this.refreshBlogSubject.asObservable();
  }

  refreshBlogs(): void {
    this.refreshBlogSubject.next();
  }
}
