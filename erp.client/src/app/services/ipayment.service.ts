import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RefundRequest {
  paymentId: string;
  amount: number;
  orderId: number;
}

@Injectable({
  providedIn: 'root'
})
export class IPaymentService {
  private apiUrl = `${environment.serverHostAddress}/api/Payment`;

  constructor(private http: HttpClient) { }

  processRefund(request: RefundRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/process-refund`, request);
  }

  getRefundableOrders(): Observable<any[]> {
    return this.http.post<any[]>(`${environment.serverHostAddress}/api/Refund/getRefundableOrders`, {});
  }

  getCompletedRefunds(): Observable<any[]> {
    return this.http.post<any[]>(`${environment.serverHostAddress}/api/Refund/getCompletedRefunds`, {});
  }
}
