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

  // Get current geolocation coordinates
  private getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    });
  }

  // Fetch country details using latitude and longitude
  private getCountryFromCoordinates(lat: number, lon: number): Promise<string> {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    return this.http
      .get<any>(url)
      .toPromise()
      .then((response) => response.countryName);
  }

  // Combined method to fetch the user's country
  public async getUserCountry(): Promise<string> {
    try {
      const location = await this.getCurrentLocation();
      const country = await this.getCountryFromCoordinates(
        location.latitude,
        location.longitude
      );

      return country || 'India';
    } catch (error) {
      return 'India';
    }
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
        return new MasterData(); // Return null or handle the error as needed
      }
    }
    return new MasterData(); // Return null if no user data is found
  }
}
