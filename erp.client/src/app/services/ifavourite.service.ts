import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { DbResult } from '../models/dbresult.model';
import { environment } from '../../environments/environment';
import { Favourite } from '../models/favourite.model';
import { RequestParms } from '../models/requestParms';

@Injectable({
  providedIn: 'root'
})
export class IFavouriteService {

  private apiUrl = `${environment.serverHostAddress}/api/Favourite`;
  private refreshSubject = new Subject<void>();

  constructor(private http: HttpClient) { }

  getFavourites(requestParms: RequestParms): Observable<Favourite[]> {
    return this.http.post<Favourite[]>(this.apiUrl + "/getFavourites", requestParms);
  }

  createOrUpdateFavourite(fav: Favourite): Observable<DbResult> {
    fav.f_cre_date = new Date().toISOString();
    return this.http.post<DbResult>(this.apiUrl + "/createOrUpdateFavourite", fav);
  }

  deleteFavourite(id: number): Observable<DbResult> {
    return this.http.post<DbResult>(this.apiUrl + "/deleteFavourite", id);
  }

  get refreshFavourites$() {
    return this.refreshSubject.asObservable();
  }

  refreshFavourites(): void {
    this.refreshSubject.next();
  }
}