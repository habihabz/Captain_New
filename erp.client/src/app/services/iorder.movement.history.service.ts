import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { DbResult } from '../models/dbresult.model';
import { environment } from '../../environments/environment';
import { ILoginService } from './ilogin.service';
import { OrderMovementHistory } from '../models/order.movement.history.model';

@Injectable({
  providedIn: 'root'
})
export class IOrderMovementHistoryService {

  private apiUrl = `${environment.serverHostAddress}/api/OrderMovementHistory`;
  private refreshSubject = new Subject<void>();

  constructor(
    private http: HttpClient,
    private iLoginService: ILoginService
  ) { }

  getOrderMovementHistories(): Observable<OrderMovementHistory[]> {
    return this.http.post<OrderMovementHistory[]>(`${this.apiUrl}/getOrderMovementHistories`, {});
  }

  getOrderMovementHistory(id: number): Observable<OrderMovementHistory> {
    return this.http.post<OrderMovementHistory>(`${this.apiUrl}/getOrderMovementHistory`, id);
  }

  getOrderMovementHistoriesByOrder(orderNo: number): Observable<OrderMovementHistory[]> {
    return this.http.post<OrderMovementHistory[]>(`${this.apiUrl}/getOrderMovementHistoriesByOrder`, orderNo);
  }

  getOrderMovementHistoriesByReturn(returnNo: number): Observable<OrderMovementHistory[]> {
    return this.http.post<OrderMovementHistory[]>(`${this.apiUrl}/getOrderMovementHistoriesByReturn`, returnNo);
  }

  deleteOrderMovementHistory(id: number): Observable<DbResult> {
    return this.http.post<DbResult>(`${this.apiUrl}/deleteOrderMovementHistory`, id);
  }

  createOrderMovementHistory(data: OrderMovementHistory): Observable<DbResult> {
    return this.http.post<DbResult>(`${this.apiUrl}/createOrderMovementHistory`, data);
  }

  get refresh$() {
    return this.refreshSubject.asObservable();
  }

  refresh(): void {
    this.refreshSubject.next();
  }
}