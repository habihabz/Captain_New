import { Component } from '@angular/core';
import { Customer } from '../../../models/customer.model';
import { Router } from '@angular/router';
import { DbResult } from '../../../models/dbresult.model';
import { User } from '../../../models/user.model';
import { IuserService } from '../../../services/iuser.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.css'
})
export class UserRegistrationComponent {
  users: User[] = [];
  user: User = new User();
  is_get_updates: boolean = false;
  agree_terms: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  constructor(private iuserService: IuserService, private router: Router) {


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
