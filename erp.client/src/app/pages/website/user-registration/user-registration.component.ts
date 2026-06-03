import { Component, OnInit } from '@angular/core';
import { Customer } from '../../../models/customer.model';
import { Router } from '@angular/router';
import { DbResult } from '../../../models/dbresult.model';
import { User } from '../../../models/user.model';
import { IuserService } from '../../../services/iuser.service';
import { environment } from '../../../../environments/environment';

import Swal from 'sweetalert2';

declare var google: any;

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.css'
})
export class UserRegistrationComponent implements OnInit {
  users: User[] = [];
  user: User = new User();
  is_get_updates: boolean = false;
  agree_terms: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  constructor(private iuserService: IuserService, private router: Router) {


  }

  ngOnInit(): void {
    // Initialize Google Sign-In
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleGoogleCredentialResponse.bind(this)
      });
      google.accounts.id.renderButton(
        document.getElementById("googleSignInBtnReg"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }

  handleGoogleCredentialResponse(response: any) {
    if (response.credential) {
      this.iuserService.googleLogin(response.credential).subscribe({
        next: (res: any) => {
          if (res.message === "Success") {
            localStorage.setItem('token', res.token);
            sessionStorage.setItem('user', JSON.stringify(res.user));
            
            Swal.fire({
              icon: res.isNewUser ? 'success' : 'info',
              title: res.isNewUser ? 'Account Created' : 'Account Already Exists',
              text: res.isNewUser ? 'Welcome to Captain! Please complete your profile.' : 'You already have an account. Redirecting you now...',
              timer: res.isNewUser ? 3000 : 2000,
              showConfirmButton: false
            }).then(() => {
              if (res.isNewUser) {
                this.router.navigate(['profile']);
              } else if(res.user.u_is_admin == 'Y'){
                this.router.navigate(['dashboard']);
              } else {
                this.router.navigate(['web-home']);
              }
            });
          } else {
            Swal.fire('Registration Failed', res.message, 'error');
          }
        },
        error: (err: any) => {
          Swal.fire('Error', err.error?.message || 'Google sign-up failed. Please try again.', 'error');
        }
      });
    }
  }

  registerUser(): void {

    if (this.user.u_name != '' && this.user.u_phone != '' &&
      this.user.u_email != '' && this.user.u_username != ''
      && this.user.u_password != '' && this.user.u_date_of_birth != '') {

      this.user.u_is_get_updates = this.is_get_updates ? 'Y' : 'N';
      this.user.u_agree_terms = this.agree_terms ? 'Y' : 'N';
      this.iuserService.registerUser(this.user).subscribe(
        (data: DbResult) => {
          if (data.message === "Success") {
            Swal.fire({
              title: 'Registration Successful!',
              text: 'Your account has been created. Now you can log in.',
              icon: 'success',
              confirmButtonColor: '#20c997',
              confirmButtonText: 'Go to Login'
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['login']);
              }
            });
          } else {
            Swal.fire({
              title: 'Registration Failed',
              text: data.message,
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
          }
        },
        (error: any) => {
          console.error('Registration failed', error);
          Swal.fire({
            title: 'Error',
            text: 'Something went wrong. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      );
    }
    else {
      Swal.fire({
        title: 'Form Incomplete',
        text: 'Please enter all details correctly.',
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
    }
  }

  onProfileFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
