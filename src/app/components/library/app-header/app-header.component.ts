import { navigation } from './../../../app-navigation';
import { Router } from '@angular/router';
import {
  Component,
  NgModule,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';

import { UserPanelModule } from '../user-panel/user-panel.component';
import { AuthService, IUser } from 'src/app/services';
import { ThemeSwitcherModule } from 'src/app/components/library/theme-switcher/theme-switcher.component';
import { CustomReuseStrategy } from 'src/app/State-Management/custom-reuse-strategy';

@Component({
  selector: 'app-header',
  templateUrl: 'app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit {
  @Output()
  menuToggle = new EventEmitter<boolean>();

  @Input()
  menuToggleEnabled = false;

  @Input()
  title!: string;

  user: IUser | null = { email: '' };

  userMenuItems = [
    {
      text: 'Logout',
      icon: 'runner',
      onClick: () => {
        this.authService.logOut().subscribe((response: any) => {
          if (response) {
            localStorage.clear();
            sessionStorage.clear();
            this.customReuse.clearStoredData();
            this.router.navigate(['/auth/login']).then(() => {
              setTimeout(() => {
                window.location.reload();
              }, 0);
            });
          }
        });
      },
    },
    {
      text: 'Change Password',
      icon: 'preferences',
      onClick: () => {
        this.router.navigate(['/change-password']);
      },
    },
  ];
  userName: any;
  isloggedIn: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private customReuse: CustomReuseStrategy
  ) {}

  ngOnInit() {
    this.userName = sessionStorage.getItem('paramsid');
    this.isloggedIn = sessionStorage.getItem('isLogging');

    this.user = {
      email: '',
      name: this.userName,
      avatarUrl: '../../../../assets/pngegg (2).png',
    };

    // this.authService.getUser().then((e) => (this.user = e.data));
  }

  logout_Click() {
    this.authService.logOut();
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  };
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    DxToolbarModule,
    ThemeSwitcherModule,
    UserPanelModule,
  ],
  declarations: [AppHeaderComponent],
  exports: [AppHeaderComponent],
})
export class AppHeaderModule {}
