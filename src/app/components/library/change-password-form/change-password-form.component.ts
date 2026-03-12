import { CommonModule } from '@angular/common';
import {
  Component,
  NgModule,
  OnInit,
  OnDestroy,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ValidationCallbackData,
  ValidationRule,
} from 'devextreme-angular/common';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import notify from 'devextreme/ui/notify';
import { AuthService, DataService } from '../../../services';

import { Subscription } from 'rxjs';
import {
  FormPopupComponent,
  FormPopupModule,
} from '../../utils/form-popup/form-popup.component';
import {
  PasswordTextBoxComponent,
  PasswordTextBoxModule,
} from '../password-text-box/password-text-box.component';
import {
  DxValidationGroupComponent,
  DxDataGridModule,
  DxButtonModule,
  DxTextBoxModule,
  DxValidatorModule,
  DxValidationGroupModule,
} from 'devextreme-angular';
import { CustomReuseStrategy } from 'src/app/State-Management/custom-reuse-strategy';
import { Location } from '@angular/common';

@Component({
  selector: 'app-change-password-form',
  templateUrl: './change-password-form.component.html',
  styleUrls: ['./change-password-form.component.scss'],
})
export class ChangePasswordFormComponent implements OnInit {
  @ViewChild('validationGroup', { static: true })
  validationGroup: DxValidationGroupComponent;

  securityPolicyData: any;
  UserID: any;
  loginID: any;
  oldPassword: any;
  getOldPassword: any;
  newPassword: string = '';
  confirmPassword: string = '';
  confirmPasswordBorderColor: string = '1px solid #ddd'; // Default border color
  oldPasswordBorderColor: string = '1px solid #ddd'; // Default border color
  oldPasswordError: string = ''; // Error message for old password validation
  dummyId: any;
  showConfirmPassword: boolean = false;
  isPasswordVisible: boolean = false;
  isOldPasswordVisible: boolean = false;
  isSaving: boolean = false; // Property to track saving state

  constructor(
    private service: DataService,
    private authService: AuthService,
    private route: Router,
    private reuseStrategy: CustomReuseStrategy,
    private location: Location
  ) {
    this.UserID = sessionStorage.getItem('userID');
    this.loginID = sessionStorage.getItem('paramsid');
  }

  validatePasswordMatch = (): boolean => {
    return this.newPassword === this.confirmPassword;
  };

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible; // Toggle the visibility
  }
  toggleOldPasswordVisibility(): void {
    this.isOldPasswordVisible = !this.isOldPasswordVisible; // Toggle the visibility
  }

  saveNewPassword() {
    this.isSaving = true;
    // Validate the entire validation group
    const validationResult = this.validationGroup.instance.validate();
    // Check if the form is valid before proceeding
    if (!validationResult.isValid) {
      this.isSaving = false;
      return;
    }
    // Check if the new password meets the security policy
    if (!this.checkPasswordStrength()) {
      this.isSaving = false;
      // Show error message if the password does not meet the security policy
      notify(
        {
          message: 'New password does not meet the security requirements.',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error'
      );
      return; // Stop execution if the password does not meet the policy
    }
    const PasswordData = {
      UserID: this.UserID,
      LoginID: this.loginID,
      PresentPassword: this.oldPassword,
      NewPassword: this.newPassword,
    };
    console.log(PasswordData, 'password form data');
    this.service.reset_Password(PasswordData).subscribe((res: any) => {
      try {
        if (res.flag === '1') {
          notify(
            {
              message:
                'you password has been changed successfully. Please login again',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
          this.authService.logOut();
          // this.route.navigate(['/auth/login']);
          // Navigate to login page after notification
          // setTimeout(() => {
          //   this.authService.logOut();
          //   // this.closeChangePassword();
          // });
        } else {
          this.isSaving = false;
          notify(
            {
              message: res.message,
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'error'
          );
        }
      } catch (error) {
        this.isSaving = false;
        notify(
          {
            message: 'Password update operation failed',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'error'
        );
      }
    });
  }

  closeChangePassword() {
    this.location.back();
  }

  validateField(fieldName: string): boolean {
    // Trigger validation for a specific field
    const instance = (
      document.getElementById(fieldName) as any
    ).dxValidator?.instance();
    if (instance) {
      return instance.validate().isValid;
    }
    return false;
  }

  ngOnInit(): void {
    this.getSecurityPolicyData();
  }

  // onOldPasswordValueChanged(event: any): void {
  //   this.oldPassword = event.value;
  // }

  // ========Custom validation function for old password======
  validateOldPassword = (params: any): boolean => {
    if (!this.oldPassword) {
      params.rule.message = 'Incorrect password'; // Set custom error message
      this.oldPasswordBorderColor = '2px solid green';
      return false; // Validation fails
    }
    return true; // Validation passes
  };

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  //========= fetch security policy data =========
  getSecurityPolicyData() {
    this.service.getUserSecurityPolicityData().subscribe((res: any) => {
      if (res.flag === '1') {
        this.securityPolicyData = this.convertToKeyBooleanMap(res);
        console.log('user security policy data', this.securityPolicyData);
      }
    });
  }
  // ==== convert api response format =============
  convertToKeyBooleanMap(apiResponse: any): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    apiResponse.data.forEach((item: any) => {
      result[item.key] = item.value === '1';
    });
    return result;
  }
  // ==================================
  onPasswordInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    // Remove spaces from the current value
    const sanitizedValue = target.value.replace(/\s/g, '');
    // Update the target value and the newPassword property
    target.value = sanitizedValue;
    this.newPassword = sanitizedValue; // Update the password value

    this.checkPasswordStrength(); // Call the function to check the strength of the password
  }

  onConfirmPasswordKeyDown(event: KeyboardEvent): void {
    // Capture current input value
    const target = event.target as HTMLInputElement;
    setTimeout(() => {
      this.confirmPassword = target.value; // Get the updated password after keydown
      this.validateConfirmPassword(); // Call the function to check the strength of the password
    }, 0);
  }

  // ====Function to check if the password meets all security requirements======
  checkPasswordStrength(): boolean {
    // Skip password validation if not required
    if (
      !this.securityPolicyData ||
      !this.securityPolicyData.PasswordValidationRequired
    ) {
      return true;
    }

    return (
      this.checkNumbers() &&
      this.checkUppercase() &&
      this.checkLowercase() &&
      this.checkSpecialCharacters() &&
      this.checkMinimumLength()
    );
  }

  validateConfirmPassword(): void {
    // Validate if confirmPassword matches newPassword
    if (this.confirmPassword === this.newPassword) {
      this.confirmPasswordBorderColor = '2px solid green'; // Set border color to green
    } else {
      this.confirmPasswordBorderColor = '2px solid red'; // Set border color to red
    }
  }

  checkNumbers(): boolean {
    return this.securityPolicyData.Numbers ? /\d/.test(this.newPassword) : true;
  }

  checkUppercase(): boolean {
    return this.securityPolicyData.UppercaseCharacters
      ? /[A-Z]/.test(this.newPassword)
      : true;
  }

  checkLowercase(): boolean {
    return this.securityPolicyData.LowercaseCharacters
      ? /[a-z]/.test(this.newPassword)
      : true;
  }

  checkSpecialCharacters(): boolean {
    return this.securityPolicyData.SpecialCharacters
      ? /[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword)
      : true;
  }

  checkMinimumLength(): boolean {
    return this.newPassword.length >= this.securityPolicyData.MinimumLength;
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxTextBoxModule,
    FormPopupModule,
    DxValidatorModule,
    DxValidationGroupModule,
  ],
  providers: [],
  declarations: [ChangePasswordFormComponent],
  exports: [ChangePasswordFormComponent],
})
export class ChangePasswordFormModule {}
