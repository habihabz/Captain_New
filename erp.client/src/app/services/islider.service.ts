import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Slider } from '../models/slider.model';
import { DbResult } from '../models/dbresult.model';
import { environment } from '../../environments/environment';
import { ILoginService } from './ilogin.service';

@Injectable({
  providedIn: 'root'
})
export class ISliderService {
  private apiUrl = `${environment.serverHostAddress}/api/Slider`;
  private refreshSliderSubject = new Subject<void>();

  constructor(
    private http: HttpClient,
    private iLoginService: ILoginService
  ) {}

  getSliders(): Observable<Slider[]> {
    return this.http.post<Slider[]>(`${this.apiUrl}/getSliders`, {});
  }


  getSlider(id: number): Observable<Slider> {
    return this.http.post<Slider>(`${this.apiUrl}/getSlider`, id);
  }


  deleteSlider(id: number): Observable<DbResult> {
    return this.http.post<DbResult>(`${this.apiUrl}/deleteSlider`, id);
  }

  
  createOrUpdateSlider(formData: FormData): Observable<DbResult> {
    return this.http.post<DbResult>(`${this.apiUrl}/createOrUpdateSlider`, formData);
  }

  
  get refreshSliders$() {
    return this.refreshSliderSubject.asObservable();
  }

  refreshSliders(): void {
    this.refreshSliderSubject.next();
  }
}
