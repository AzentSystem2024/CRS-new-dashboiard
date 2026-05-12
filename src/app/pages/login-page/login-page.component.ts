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
    private customReuse: CustomReuseStrategy,
  ) {
    this.customReuse.clearStoredData();
    this.loginpage = {
      UserName: null,
      Password: null,
    };
  }

  onEnterUserName = () => {
    const passwordBox = document.querySelector(
      '[name="Password"]',
    ) as HTMLElement;
    if (passwordBox) {
      passwordBox.focus();
    }
  };

  onEnterPassword = () => {
    this.Login();
  };

  Login(): void {
    const { UserName: userName, Password: password } = this.loginpage;

    //================ Validate Fields =================
    if (!userName || !password) {
      alert('Please fill all the fields');
      return;
    }

    this.loadingVisible = true;

    //================ Login API =================
    this.service.dashboard_Login(userName, password).subscribe({
      next: (response: any) => {
        if (response?.flag !== '1') {
          this.loadingVisible = false;
          notify(response?.message || 'Login failed', 'error', 3000);
          return;
        }

        //================ Store Session =================
        const { LoginID, userid, SessionID } = response;

        sessionStorage.setItem('paramsid', LoginID);
        sessionStorage.setItem('userID', userid);
        sessionStorage.setItem('SessionID', SessionID);
        sessionStorage.setItem('isLogging', 'true');

        //================ Fetch Dashboard Tabs =================
        this.loadDashboardTabs();
      },

      error: (err) => {
        console.error('Login API Error:', err);
        this.loadingVisible = false;
        notify('Something went wrong. Please try again.', 'error', 3000);
      },
    });
  }

  //================ Load Dashboard Tabs =================
  private loadDashboardTabs(): void {
    const userID = sessionStorage.getItem('paramsid');

    if (!userID || userID === 'undefined') {
      console.error('UserID not found in sessionStorage');
      this.loadingVisible = false;
      return;
    }

    this.service.fetch_tab_Data_mainLayout().subscribe({
      next: (response: any) => {
        this.loadingVisible = false;

        if (response?.flag !== '1') {
          notify('Failed to load dashboards', 'error', 3000);
          return;
        }

        console.log('Dashboard data fetched successfully:', response);

        this.tabs = response?.dashboards || [];

        if (this.tabs.length > 0) {
          this.sharedServc.navigateToDashboard(this.tabs[0].ID);
        } else {
          this.router.navigate(['/Empty-message-page']);
        }
      },

      error: (err) => {
        console.error('Dashboard Fetch Error:', err);
        this.loadingVisible = false;
        notify('Unable to load dashboard data', 'error', 3000);
      },
    });
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
