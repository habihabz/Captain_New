import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { RequestParms } from '../models/requestParms';
import { MasterData } from '../models/master.data.model';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  requestParms: RequestParms = new RequestParms();
  masterData: MasterData = new MasterData();
  private apiUrl = `${environment.serverHostAddress}/api/MasterData`;
  constructor(private http: HttpClient) { }

  // Combined method to fetch the user's country
  public async getUserCountry(): Promise<string> {
    return 'India';
  }

  getCountry(requestParms: RequestParms): Observable<MasterData> {
    return this.http.post<MasterData>(this.apiUrl + "/getCountry", requestParms);
  }

  getCurrentCountry(): MasterData {
    const currentCountryJson = sessionStorage.getItem('country');
    if (currentCountryJson) {
      try {
        const masterData: MasterData = JSON.parse(currentCountryJson);
        return masterData;
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
    const defaultCountry = new MasterData();
    defaultCountry.md_id = 24;
    defaultCountry.md_name = 'India';
    defaultCountry.md_active_yn = 'Y';
    defaultCountry.md_type = 'Country';
    return defaultCountry;
  }
}
