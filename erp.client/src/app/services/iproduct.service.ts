import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DbResult } from '../models/dbresult.model';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';
import { RequestParms } from '../models/requestParms';
import { ProductSearchParms } from '../models/product.search.parms.model';
import { ProdAttachement } from '../models/prod.attachments.model';

@Injectable({
  providedIn: 'root'
})
export class IProductService {
  private apiUrl = `${environment.serverHostAddress}/api/Product`;
  private refreshProductsSubject = new Subject<void>();

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.post<Product[]>(this.apiUrl + "/getProducts", {}).pipe(
      map(products => products.map(p => this.parseProductData(p)))
    );
  }

  getProductsByCountry(id: number): Observable<Product[]> {
    return this.http.post<Product[]>(this.apiUrl + "/getProductsByCountry", id).pipe(
      map(products => products.map(p => this.parseProductData(p)))
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.post<Product>(this.apiUrl + "/getProduct", id).pipe(
      map(p => this.parseProductData(p))
    );
  }

  getProductByCountry(requestParms: RequestParms): Observable<Product> {
    return this.http.post<Product>(this.apiUrl + "/getProductByCountry", requestParms).pipe(
      map(p => this.parseProductData(p))
    );
  }

  deleteProduct(id: number): Observable<DbResult> {
    return this.http.post<DbResult>(this.apiUrl + "/deleteProduct", id);
  }

  createOrUpdateProduct(formData: FormData): Observable<DbResult> {
    return this.http.post<DbResult>(this.apiUrl + "/createOrUpdateProduct", formData);
  }

  getProductsByFilters(productSearchParms: ProductSearchParms): Observable<Product[]> {
    return this.http.post<Product[]>(this.apiUrl + "/getProductsByFilters", productSearchParms).pipe(
      map(products => products.map(p => this.parseProductData(p)))
    );
  }

  getProductAttachementsByColor(requestParms: RequestParms): Observable<ProdAttachement[]> {
    return this.http.post<ProdAttachement[]>(this.apiUrl + "/getProductAttachementsByColor", requestParms);
  }

  uploadProdAttachements(formData: FormData): Observable<DbResult> {
    return this.http.post<DbResult>(this.apiUrl + "/uploadProdAttachements", formData);
  }

  deleteProductAttachement(id: number): Observable<DbResult> {
    return this.http.post<DbResult>(this.apiUrl + "/deleteProductAttachement", id);
  }

  get refreshProducts$() {
    return this.refreshProductsSubject.asObservable();
  }
  refreshProducts(): void {
    this.refreshProductsSubject.next();
  }

  private parseProductData(p: Product): Product {
    if (p.p_attachements) {
      try { p.parsed_attachments = JSON.parse(p.p_attachements); } catch (e) { p.parsed_attachments = []; }
    } else {
      p.parsed_attachments = [];
    }
    if (p.p_colors) {
      try { p.parsed_colors = JSON.parse(p.p_colors); } catch (e) { p.parsed_colors = []; }
    } else {
      p.parsed_colors = [];
    }
    return p;
  }
}
