import { Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { IuserService } from '../../../services/iuser.service';
import { ILoginService } from '../../../services/ilogin.service';
import { User } from '../../../models/user.model';
import { DbResult } from '../../../models/dbresult.model';
import { environment } from '../../../../environments/environment';
declare var $: any;

@Component({
  selector: 'app-topnav',
  templateUrl: './topnav.component.html',
  styleUrl: './topnav.component.css',
  encapsulation: ViewEncapsulation.None 
})
export class TopnavComponent {
  currentUser: User = new User();
  newPassword = "";
  fileUrl = environment.fileUrL;

  constructor(
    private elRef: ElementRef,
    private router: Router,
    private userService: IuserService,
    private loginService: ILoginService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  onLogout() {
    this.loginService.logout();
  }

  openOwnPasswordModal() {
    this.newPassword = "";
    $('#ownPasswordModal').modal('show');
  }

  updateOwnPassword() {
    if(!this.newPassword) {
      alert("Please enter a new password");
      return;
    }
    
    this.userService.updatePassword(this.currentUser.u_id, this.newPassword).subscribe(
      (data: DbResult) => {
        if(data.message == "Success") {
          alert("Your password has been updated successfully");
          $('#ownPasswordModal').modal('hide');
        } else {
          alert(data.message);
        }
      }
    );
  }

  openProfileModal() {
    this.currentUser = this.userService.getCurrentUser();
    $('#myProfileModal').modal('show');
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.userService.uploadProfileImage(this.currentUser.u_id, file).subscribe(
        (data: DbResult) => {
          if (data.message.includes("/uploads")) {
            this.currentUser.u_image_url = data.message;
            
            // Update session storage so changes reflect globally
            const userJson = sessionStorage.getItem('user');
            if (userJson) {
              const user = JSON.parse(userJson);
              user.u_image_url = data.message;
              sessionStorage.setItem('user', JSON.stringify(user));
            }
            alert("Profile picture updated successfully");
          } else {
            alert(data.message);
          }
        },
        error => alert("Failed to upload image")
      );
    }
  }

  saveProfile() {
    if (!this.currentUser.u_name || !this.currentUser.u_email) {
      alert("Name and Email are required");
      return;
    }

    this.userService.createOrUpdateUser(this.currentUser).subscribe(
      (data: DbResult) => {
        if (data.message === "Success") {
          sessionStorage.setItem('user', JSON.stringify(this.currentUser));
          alert("Profile updated successfully");
          $('#myProfileModal').modal('hide');
        } else {
          alert(data.message);
        }
      },
      error => alert("Failed to update profile")
    );
  }
}
