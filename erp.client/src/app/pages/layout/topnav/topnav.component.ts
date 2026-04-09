import { Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { IuserService } from '../../../services/iuser.service';
import { User } from '../../../models/user.model';
import { DbResult } from '../../../models/dbresult.model';
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

  constructor(
    private elRef: ElementRef,
    private router: Router,
    private userService: IuserService
  ) {
    this.currentUser = this.userService.getCurrentUser();
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
}
