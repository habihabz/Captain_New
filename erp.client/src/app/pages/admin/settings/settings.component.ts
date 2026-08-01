import { Component, OnInit } from '@angular/core';
import { IConstantValueService } from '../../../services/iconstant.values.service';
import { ConstantValue } from '../../../models/constant.value.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DbResult } from '../../../models/dbresult.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  shopEnabled: boolean = true;
  isLoading: boolean = false;
  constantValue: ConstantValue | null = null;

  constructor(
    private constantService: IConstantValueService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading = true;
    this.constantService.getConstantValueByName('SHOP_ENABLED').subscribe({
      next: (res: ConstantValue) => {
        if (res && res.cv_id) {
          this.constantValue = res;
          this.shopEnabled = res.cv_value?.toUpperCase() === 'TRUE';
        } else {
          // Defaults
          this.shopEnabled = true;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        // Default to true
        this.shopEnabled = true;
      }
    });
  }

  toggleShop(event: any) {
    this.shopEnabled = event.target.checked;
    this.saveSettings();
  }

  saveSettings() {
    if (!this.constantValue) {
      this.constantValue = new ConstantValue();
      this.constantValue.cv_name = 'SHOP_ENABLED';
      this.constantValue.cv_active_yn = 'Y';
    }
    this.constantValue.cv_value = this.shopEnabled ? 'TRUE' : 'FALSE';
    
    this.constantService.createOrUpdateConstantValue(this.constantValue).subscribe({
      next: (res: DbResult) => {
        if (res.message === 'Success') {
          this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to save settings: ' + res.message, 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.snackBar.open('Error saving settings', 'Close', { duration: 3000 });
      }
    });
  }
}
