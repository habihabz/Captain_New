import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { DbResult } from '../models/dbresult.model';
import { PackagingType } from '../models/packaging.type.model';

@Injectable({
  providedIn: 'root'
})
export class PackagingTypeService {
  private apiUrl = `${environment.serverHostAddress}/api/PackagingType/`;
  
  private refreshSubject = new Subject<void>();
  refreshPackagingTypes$ = this.refreshSubject.asObservable();

  constructor(private http: HttpClient) { }

  refreshPackagingTypes() {
    this.refreshSubject.next();
  }

  getPackagingTypes(): Observable<PackagingType[]> {
    return this.http.get<PackagingType[]>(this.apiUrl + 'getPackagingTypes');
  }

  getPackagingType(id: number): Observable<PackagingType> {
    return this.http.get<PackagingType>(this.apiUrl + 'getPackagingType/' + id);
  }

  createOrUpdatePackagingType(packagingType: PackagingType): Observable<DbResult> {
    return this.http.post<DbResult>(this.apiUrl + 'createOrUpdatePackagingType', packagingType);
  }

  deletePackagingType(id: number): Observable<DbResult> {
    return this.http.delete<DbResult>(this.apiUrl + 'deletePackagingType/' + id);
  }
}
