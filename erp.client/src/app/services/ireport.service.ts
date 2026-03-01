import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ReportParm } from '../models/report.parms.model';
import { RequestParms } from '../models/requestParms';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class IReportService {
    private reportUrl = `${environment.serverHostAddress}/api/Report`;
    constructor(private http: HttpClient) { }
    getOrderReport(reportParms: ReportParm): Observable<any[]> {
        return this.http.post<any[]>(`${this.reportUrl}/getOrderReport`, reportParms);
    }
   
}