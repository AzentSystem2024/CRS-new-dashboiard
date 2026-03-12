import { Component, HostBinding, OnDestroy } from '@angular/core';
import {
  AppInfoService,
  AuthService,
  ScreenService,
  ThemeService,
} from './services';
import { SharedService } from './services/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes)
      .filter((cl) => this.screen.sizes[cl])
      .join(' ');
  }

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private screen: ScreenService,
    public appInfo: AppInfoService
  ) {
    if (!localStorage.getItem('app-theme')) {
      localStorage.setItem('app-theme', 'dark');
    }
    themeService.setAppTheme();
  }

  isAuthenticated() {
    return this.authService.loggedIn;
  }

  ngOnDestroy(): void {
    this.screen.breakpointSubscription.unsubscribe();
  }
}
