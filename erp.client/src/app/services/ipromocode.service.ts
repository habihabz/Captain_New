import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Promocode } from '../models/promocode.model';
import { DbResult } from '../models/dbresult.model';
import { RequestParms } from '../models/requestParms';

@Injectable({
  providedIn: 'root'
})
export class IPromocodeService {
  private apiUrl = `${environment.serverHostAddress}/api/Promocode`;
  private refreshSubject = new Subject<void>();

  constructor(private http: HttpClient) { }

  getPromocodes(params: RequestParms): Observable<Promocode[]> {
    return this.http.post<Promocode[]>(`${this.apiUrl}/getPromocodes`, params);
  }

  getPromocode(id: number): Observable<Promocode> {
    return this.http.post<Promocode>(`${this.apiUrl}/getPromocode`, id);
  }

  getPromocodeByCode(code: string): Observable<Promocode> {
    return this.http.post<Promocode>(`${this.apiUrl}/getPromocodeByCode`, JSON.stringify(code), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  createOrUpdatePromocode(promocode: Promocode): Observable<DbResult> {
    promocode.pc_cre_date = new Date().toISOString();
    return this.http.post<DbResult>(`${this.apiUrl}/createOrUpdatePromocode`, promocode);
  }

  deletePromocode(id: number): Observable<DbResult> {
    return this.http.post<DbResult>(`${this.apiUrl}/deletePromocode`, id);
  }

  validatePromocode(code: string): Observable<DbResult> {
    return this.http.post<DbResult>(`${this.apiUrl}/validatePromocode`, JSON.stringify(code), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  get refresh$() {
    return this.refreshSubject.asObservable();
  }

  refresh(): void {
    this.refreshSubject.next();
  }
}
