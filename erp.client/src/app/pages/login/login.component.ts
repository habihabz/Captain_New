import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { ILoginService } from '../../services/ilogin.service';
import { UserCredential } from '../../models/usercredential.model';
import { IuserService } from '../../services/iuser.service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

declare var google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: User = new User();
  credential: UserCredential = new UserCredential();
  currentYear: number=new Date().getFullYear();
  constructor(
    private http: HttpClient, 
    private router: Router,
    private iloginService: ILoginService,
    private userService: IuserService
  ) {}

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();

    // Initialize Google Sign-In
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleGoogleCredentialResponse.bind(this)
      });
      google.accounts.id.renderButton(
        document.getElementById("googleSignInBtn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }

  handleGoogleCredentialResponse(response: any) {
    if (response.credential) {
      this.userService.googleLogin(response.credential).subscribe({
        next: (res: any) => {
          if (res.message === "Success") {
            localStorage.setItem('token', res.token);
            sessionStorage.setItem('user', JSON.stringify(res.user));
            
            if (res.isNewUser) {
              this.router.navigate(['profile']);
            } else if(res.user.u_is_admin == 'Y'){
              this.router.navigate(['dashboard']);
            } else {
              this.router.navigate(['web-home']);
            }
          } else {
            alert(res.message || 'Google login failed');
          }
        },
        error: (err: any) => {
          Swal.fire('Error', err.error?.message || 'Google sign-in failed. Please try again.', 'error');
        }
      });
    }
  }

  onLogin(): void {
    this.iloginService.getLogin(this.credential).subscribe({
      next: (data: UserCredential) => {
         
        // Handle successful login
        if (data.message === "Success") {
        
          // Store JWT token in local storage
          localStorage.setItem('token', data.token);
          sessionStorage.setItem('user',JSON.stringify(data.user))
          // Navigate to the home page
          if(data.user.u_is_admin=='Y'){
            this.router.navigate(['dashboard']);
          }
          else
          {
            this.router.navigate(['web-home']);
          }
        
        } else {
          // Handle failed login
          alert(data.message || 'Login failed');
        }
      },
      error: (error: HttpErrorResponse) => {
        // Handle error response
        console.error('Login error:', error);
        // Extract and display the error message
        const errorMessage = error.error?.message || 'An unknown error occurred';
        
      }
    });
  }
  navigateTo(moveto: string) {
 
    this.router.navigate(['/' + moveto]);
  }
  logout(): void {
    localStorage.removeItem('token'); // Remove token on logout
    this.router.navigate(['login']);
  }
}
