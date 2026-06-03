import { Component, OnInit } from '@angular/core';
import { User } from '../../../models/user.model';
import { IuserService } from '../../../services/iuser.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User = new User();
  serverUrl = environment.serverHostAddress;
  
  emailCodeSent = false;
  phoneCodeSent = false;
  emailCode = '';
  phoneCode = '';

  isEditing = false;
  editedUser: User = new User();

  constructor(
    private userService: IuserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    if (this.user.u_id > 0) {
      // Reload user to get latest verification status
      this.userService.getUser(this.user.u_id).subscribe(data => {
        this.user = data;
        sessionStorage.setItem('user', JSON.stringify(data));
      });
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.userService.uploadProfileImage(this.user.u_id, file).subscribe(
        res => {
          if (res.message && res.message !== 'Failed') {
            this.user.u_image_url = res.message; // update local image
            sessionStorage.setItem('user', JSON.stringify(this.user));
            this.snackBar.open('Profile picture updated!', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to update picture', 'Close', { duration: 3000 });
          }
        },
        err => {
          this.snackBar.open('Error uploading picture', 'Close', { duration: 3000 });
        }
      );
    }
  }

  getProfileImageUrl(): string {
    if (this.user.u_image_url && this.user.u_image_url !== 'null' && this.user.u_image_url.trim() !== '') {
      const slash = this.user.u_image_url.startsWith('/') ? '' : '/';
      return this.serverUrl + slash + this.user.u_image_url;
    }
    // Fallback default avatar
    return 'https://ui-avatars.com/api/?name=' + (this.user.u_name || 'User') + '&background=1abb9c&color=fff&size=150';
  }

  onImageError(event: any) {
    event.target.src = 'https://ui-avatars.com/api/?name=' + (this.user.u_name || 'User') + '&background=1abb9c&color=fff&size=150';
  }

  sendVerification(type: string) {
    const target = type === 'Email' ? this.user.u_email : this.user.u_phone;
    this.userService.sendVerificationCode(this.user.u_id, type, target).subscribe(
      res => {
        if (res.message === 'Success') {
          if (type === 'Email') this.emailCodeSent = true;
          if (type === 'Phone') this.phoneCodeSent = true;
          this.snackBar.open(`${type} verification code sent!`, 'Close', { duration: 3000 });
        } else {
          this.snackBar.open(`Failed to send ${type} code.`, 'Close', { duration: 3000 });
        }
      },
      err => this.snackBar.open('Error sending code', 'Close', { duration: 3000 })
    );
  }

  verifyCode(type: string) {
    const target = type === 'Email' ? this.user.u_email : this.user.u_phone;
    const code = type === 'Email' ? this.emailCode : this.phoneCode;
    
    this.userService.verifyCode(this.user.u_id, type, target, code).subscribe(
      res => {
        if (res.message === 'Success') {
          if (type === 'Email') {
            this.user.u_email_verified = 'Y';
            this.emailCodeSent = false;
          }
          if (type === 'Phone') {
            this.user.u_phone_verified = 'Y';
            this.phoneCodeSent = false;
          }
          sessionStorage.setItem('user', JSON.stringify(this.user));
          this.snackBar.open(`${type} verified successfully!`, 'Close', { duration: 3000 });
        } else {
          this.snackBar.open(res.message, 'Close', { duration: 3000 });
        }
      },
      err => this.snackBar.open('Error verifying code', 'Close', { duration: 3000 })
    );
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editedUser = JSON.parse(JSON.stringify(this.user));
    }
  }

  saveProfile() {
    this.userService.updateProfile(this.editedUser).subscribe(
      res => {
        if (res.message === 'Success') {
          // Update local verification state if they changed contact info
          if (this.user.u_email !== this.editedUser.u_email) {
            this.editedUser.u_email_verified = 'N';
          }
          if (this.user.u_phone !== this.editedUser.u_phone) {
            this.editedUser.u_phone_verified = 'N';
          }
          this.user = { ...this.editedUser };
          sessionStorage.setItem('user', JSON.stringify(this.user));
          this.isEditing = false;
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open(res.message || 'Failed to update profile', 'Close', { duration: 3000 });
        }
      },
      err => {
        this.snackBar.open('Error updating profile', 'Close', { duration: 3000 });
      }
    );
  }
}
