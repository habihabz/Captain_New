import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ConstantValue } from '../models/constant.value.model';
import { DbResult } from '../models/dbresult.model';
import { environment } from '../../environments/environment';
import { ILoginService } from './ilogin.service';

@Injectable({
  providedIn: 'root'
})
export class IConstantValueService {

  private apiUrl = `${environment.serverHostAddress}/api/ConstantValue`;
  private refreshConstantSubject = new Subject<void>();

  constructor(
    private http: HttpClient,
    private iLoginService: ILoginService
  ) {}

  getConstantValues(): Observable<ConstantValue[]> {
    return this.http.post<ConstantValue[]>(`${this.apiUrl}/getConstantValues`, {});
  }

  getConstantValue(id: number): Observable<ConstantValue> {
    return this.http.post<ConstantValue>(`${this.apiUrl}/getConstantValue`, id);
  }

  deleteConstantValue(id: number): Observable<DbResult> {
    return this.http.post<DbResult>(`${this.apiUrl}/deleteConstantValue`, id);
  }

  createOrUpdateConstantValue(data: ConstantValue): Observable<DbResult> {
    data.cv_cre_date = new Date().toISOString();
    return this.http.post<DbResult>(`${this.apiUrl}/createOrUpdateConstantValue`, data);
  }
  getConstantValueByName(name: string): Observable<ConstantValue> {
    return this.http.post<ConstantValue>(`${this.apiUrl}/getConstantValueByName`, name);
  }

  get refreshConstants$() {
    return this.refreshConstantSubject.asObservable();
  }

  refreshConstants(): void {
    this.refreshConstantSubject.next();
  }
}