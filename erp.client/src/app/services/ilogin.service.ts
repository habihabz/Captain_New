import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { User } from '../models/user.model';
import { DbResult } from '../models/dbresult.model';
import { environment } from '../../environments/environment';
import { UserCredential } from '../models/usercredential.model';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({
  providedIn: 'root'
})
export class ILoginService {
  private apiUrl = `${environment.serverHostAddress}/api/Login`;
  
  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) { }

  getLogin(credential:UserCredential): Observable<UserCredential> {
    return this.http.post<UserCredential>(this.apiUrl + "/getLogin", credential).pipe(
      tap((response: UserCredential) => {
        localStorage.setItem('token', response.token);
      })
    );;  
  }
  logout() {
    // Clear storage
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.clear();
    localStorage.clear();

    // Clear cookies
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    // Force redirect to login
    window.location.href = '/#/login';
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
