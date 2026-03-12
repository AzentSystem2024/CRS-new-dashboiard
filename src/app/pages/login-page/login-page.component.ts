import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  DxLoadIndicatorModule,
  DxButtonModule,
  DxTextBoxModule,
  DxFormModule,
  DxLoadPanelModule,
} from 'devextreme-angular';
import { DxoValidationModule } from 'devextreme-angular/ui/nested';
import { ReactiveFormsModule } from '@angular/forms';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { firstValueFrom } from 'rxjs';
import { ReuseStrategyService } from 'src/app/State-Management/reuse-strategy.service';
import { CustomReuseStrategy } from 'src/app/State-Management/custom-reuse-strategy';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  loginpage = {
    UserName: null,
    Password: null,
  };
  loadingVisible: boolean = false;
  tabs: any;
  constructor(
    private formb: FormBuilder,
    private router: Router,
    private service: DataService,
    private sharedServc: SharedService,
    private customReuse: CustomReuseStrategy
  ) {
    this.customReuse.clearStoredData();
    this.loginpage = {
      UserName: null,
      Password: null,
    };
  }
  onEnterUserName = () => {
    const passwordBox = document.querySelector(
      '[name="Password"]'
    ) as HTMLElement;
    if (passwordBox) {
      passwordBox.focus();
    }
  };

  onEnterPassword = () => {
    this.Login();
  };

  Login() {
    this.loadingVisible = true;
    const userName = this.loginpage.UserName;
    const password = this.loginpage.Password;
    if (userName && password) {
      this.service
        .dashboard_Login(userName, password)
        .subscribe((response: any) => {
          if (response.flag === '1') {
            // notify(`${response.message}`, 'success', 3000);

            const loginId = response.LoginID;
            const userid = response.userid;
            const SessionID = response.SessionID;
            sessionStorage.setItem('paramsid', loginId);
            sessionStorage.setItem('userID', userid);
            sessionStorage.setItem('SessionID', SessionID);
            sessionStorage.setItem('isLogging', 'true');
            this.loadingVisible = false;
            // Ensure session storage is completely set before navigating
            setTimeout(() => {
              const userID = sessionStorage.getItem('paramsid');

              if (userID && userID !== 'undefined') {
                this.service
                  .fetch_tab_Data_mainLayout()
                  .subscribe((response: any) => {
                    if (response.flag === '1') {
                      this.tabs = response.dashboards;

                      if (this.tabs.length > 0) {
                        const firstTabText = this.tabs[0].ID;
                        this.sharedServc.navigateToDashboard(firstTabText);
                      } else if (this.tabs.length === 0) {
                        this.router.navigate(['/Empty-message-page']);
                      }
                    }
                  });
              } else {
                console.error('UserID not found in sessionStorage');
              }
            }, 100); // Reduced timeout to 100ms
          } else {
            this.loadingVisible = false;
            notify(`${response.message}`, 'error', 3000);
          }
        });
    } else {
      this.loadingVisible = false;
      alert('Please fill all the fields');
    }
  }
}
@NgModule({
  imports: [
    CommonModule,
    DxLoadIndicatorModule,
    DxButtonModule,
    DxTextBoxModule,
    BrowserModule,
    DxFormModule,
    DxLoadPanelModule,
    DxoValidationModule,
    ReactiveFormsModule,
  ],
  declarations: [LoginPageComponent],
  exports: [LoginPageComponent],
})
export class LoginPageModule {}
