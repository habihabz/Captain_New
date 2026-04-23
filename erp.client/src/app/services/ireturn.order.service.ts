import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DbResult } from '../models/dbresult.model';
import { RequestParms } from '../models/requestParms';

export interface ReturnOrder {
    ro_id?: number;
    ro_order_no: number;
    ro_status?: number;
    ro_status_name?: string;
    ro_reason: string;
    ro_comments?: string;
    ro_bank_name?: string;
    ro_account_no?: string;
    ro_ifsc_code?: string;
    ro_cre_by: number;
    ro_cre_date?: string;
    
    // Joined View Data
    ro_customer_name?: string;
    ro_prod_name?: string;
    ro_net_amount?: number;
    ro_payment_id?: string;
    ro_completed_yn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IReturnOrderService {
  private apiUrl = `${environment.serverHostAddress}/api/ReturnOrder`;

  constructor(private http: HttpClient) { }

  raiseReturnRequest(returnOrder: ReturnOrder): Observable<DbResult> {
    return this.http.post<DbResult>(`${this.apiUrl}/raiseReturnRequest`, returnOrder);
  }

  updateReturnStatus(returnOrder: ReturnOrder): Observable<DbResult> {
    return this.http.post<DbResult>(`${this.apiUrl}/updateReturnStatus`, returnOrder);
  }

  getReturnRequests(requestParams: RequestParms): Observable<ReturnOrder[]> {
    return this.http.post<ReturnOrder[]>(`${this.apiUrl}/getReturnRequests`, requestParams);
  }

  getReturnRequestById(id: number): Observable<ReturnOrder> {
    return this.http.post<ReturnOrder>(`${this.apiUrl}/getReturnRequestById`, id);
  }
}
