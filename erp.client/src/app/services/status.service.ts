import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { DbResult } from '../models/dbresult.model';
import { environment } from '../../environments/environment';
import { Status } from '../models/status.model';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private apiUrl = `${environment.serverHostAddress}/api/Status`;
  private subjects = new Subject<void>();

  constructor(private http: HttpClient) { }

  getStatuses(workflow: number): Observable<Status[]> {
    return this.http.post<Status[]>(this.apiUrl + "/getStatuses", workflow);
  }

  getStatus(id: number): Observable<Status> {
    return this.http.post<Status>(this.apiUrl + "/getStatus", id);
  }

  deleteStatus(id: number): Observable<DbResult> {
    return this.http.post<DbResult>(this.apiUrl + "/deleteStatus", id);
  }

  createOrUpdateStatus(status: Status): Observable<DbResult> {
    status.s_cre_date = new Date().toISOString();
    return this.http.post<DbResult>(this.apiUrl + "/createOrUpdateStatus", status);
  }

  get refresh$() {
    return this.subjects.asObservable();
  }

  refresh(): void {
    this.subjects.next();
  }
}
