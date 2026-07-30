import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { DbResult } from '../models/dbresult.model';
import { environment } from '../../environments/environment';
import { CustomerOrder as any } from '../models/customer.order.model';
import { RequestParms } from '../models/requestParms';
import { CustomerOrderDetail } from '../models/customer.order.detail.model';

@Injectable({
  providedIn: 'root'
})
export class ICustomerOrder {
  private apiUrl = `${environment.serverHostAddress}/api/CustomerOrder`;
  private refreshSubject = new Subject<void>();

  constructor(private http: HttpClient) { }

  getCustomerOrders(requestParms: RequestParms): Observable<any[]> {
    return this.http.post<any[]>(this.apiUrl + "/getCustomerOrders", requestParms);
  }

  getCreatedShipments(requestParms: RequestParms): Observable<any[]> {
    return this.http.post<any[]>(this.apiUrl + "/getCreatedShipments", requestParms);
  }

  getOrdersForShipment(requestParms: RequestParms): Observable<any[]> {
    return this.http.post<any[]>(this.apiUrl + "/getOrdersForShipment", requestParms);
  }

  getCustomerOrder(id: number): Observable<any> {
    return this.http.post<any>(this.apiUrl + "/getCustomerOrder", id);
  }

  deleteCustomerOrder(id: number): Observable<DbResult> {
    return this.http.post<DbResult>(this.apiUrl + "/deleteCustomerOrder", id);
  }

  createOrUpdateCustomerOrder(requestParms: RequestParms): Observable<DbResult> {
    return this.http.post<DbResult>(this.apiUrl + "/createOrUpdateCustomerOrder", requestParms);
  }


  getMyOrders(requestParms: RequestParms): Observable<any[]> {
    return this.http.post<any[]>(this.apiUrl + "/getMyOrders", requestParms);
  }

  updateStatusForCustomerOrder(requestParms: RequestParms): Observable<DbResult> {
    return this.http.post<DbResult>(this.apiUrl + "/updateStatusForCustomerOrder", requestParms);
  }

  cancelCustomerOrder(requestParms: RequestParms): Observable<DbResult> {
    return this.http.post<DbResult>(this.apiUrl + "/cancelCustomerOrder", requestParms);
  }


  invoice(orderId: number) {
    return this.http.get(
      `${environment.serverHostAddress}/api/CustomerOrder/invoice/${orderId}`,
      { responseType: 'blob' }
    );
  }

  get refresh$() {
    return this.refreshSubject.asObservable();
  }

  refresh(): void {
    this.refreshSubject.next();
  }

  getDelhiveryWarehouses(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.serverHostAddress}/api/Delhivery/warehouses`);
  }

  createDelhiveryShipment(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.serverHostAddress}/api/Delhivery/create-shipment`, payload);
  }

  calculateOrderWeight(orderId: number): Observable<any> {
    return this.http.get<any>(`${environment.serverHostAddress}/api/Delhivery/calculate-order-weight/${orderId}`);
  }

  trackDelhiveryShipment(waybill: string, refId: string = ''): Observable<any> {
    return this.http.get<any>(`${environment.serverHostAddress}/api/Delhivery/trackShipment/${waybill}?refId=${refId}`);
  }

  printShippingLabelInNewTab(waybill: string, pdfSize: string = '4R') {
    if (!waybill) return;
    const url = `${environment.serverHostAddress}/api/Delhivery/generateShippingLabel/${waybill}?pdf_size=${pdfSize}`;
    window.open(url, '_blank');
  }
}
