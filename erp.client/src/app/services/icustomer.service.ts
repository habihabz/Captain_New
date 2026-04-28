import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DbResult } from '../models/dbresult.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ICustomerService {
  private apiUrl = `${environment.serverHostAddress}/api/User`; // Redirected to User API
  private _refreshCustomers$ = new Subject<void>();

  get refreshCustomers$() {
    return this._refreshCustomers$;
  }

  constructor(private http: HttpClient) { }

  refreshCustomers() {
    this._refreshCustomers$.next();
  }

  getCustomers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/getUsers`);
  }

  getCustomer(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/getUser/${id}`);
  }

  createOrUpdateCustomer(user: User): Observable<DbResult> {
    return this.http.post<DbResult>(`${this.apiUrl}/createOrUpdateUser`, user);
  }

  deleteCustomer(id: number): Observable<DbResult> {
    return this.http.get<DbResult>(`${this.apiUrl}/deleteUser/${id}`);
  }

  getCustomerLogin(customerCredential: any): Observable<any> {
    return this.http.post<any>(`${environment.serverHostAddress}/api/Login/customerLogin`, customerCredential);
  }

  getCustomerByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/getUserByEmail/${email}`);
  }
}
