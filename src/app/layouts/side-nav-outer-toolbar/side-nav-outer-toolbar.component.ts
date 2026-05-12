import { DxTabsModule } from 'devextreme-angular/ui/tabs';
import {
  Component,
  OnInit,
  OnDestroy,
  NgModule,
  Input,
  ViewChild,
} from '@angular/core';
import { DxTreeViewTypes } from 'devextreme-angular/ui/tree-view';
import { DxDrawerModule, DxDrawerTypes } from 'devextreme-angular/ui/drawer';
import { DxScrollViewComponent } from 'devextreme-angular/ui/scroll-view';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterModule,
  NavigationEnd,
  Event,
  ActivatedRoute,
  Params,
} from '@angular/router';
import { ScreenService, AppInfoService, DataService } from '../../services';
import {
  SideNavigationMenuModule,
  AppHeaderModule,
  AppFooterModule,
} from '../../components';
import { Subscription } from 'rxjs';
import { ToolbarAnalyticsModule } from '../../components/utils/Search-Parameters-Page/toolbar-analytics.component';
import { ConversionCardModule } from '../../components/utils/Home-Funnel-Chart/conversion-card.component';
import { Sales, SalesOrOpportunitiesByCategory } from 'src/app/types/analytics';
import { CardAnalyticsModule } from 'src/app/components/library/card-analytics/card-analytics.component';
import { DxTabPanelModule } from 'devextreme-angular';
import { MainHomePageComponent } from 'src/app/pages/Denial-Dashboard-page/main-home-page.component';
import { AuthDashboardPageComponent } from 'src/app/pages/auth-dashboard-production/auth-dashboard-page.component';
import { EmptyDashboardMessageModule } from '../../pages/empty-dashboard-message/empty-dashboard-message.component';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  templateUrl: './side-nav-outer-toolbar.component.html',
  styleUrls: ['./side-nav-outer-toolbar.component.scss'],
  providers: [DataService],
})
export class SideNavOuterToolbarComponent implements OnInit, OnDestroy {
  @ViewChild(DxScrollViewComponent, { static: true })
  scrollView!: DxScrollViewComponent;

  @Input() title!: string;

  selectedRoute = '';
  menuOpened = false;
  temporaryMenuOpened = false;

  // opportunities: SalesOrOpportunitiesByCategory = null;
  // sales: Sales = null;

  menuMode: DxDrawerTypes.OpenedStateMode = 'shrink';
  menuRevealMode: DxDrawerTypes.RevealMode = 'expand';

  minMenuSize = 0;
  shaderEnabled = false;

  tabs: any[] = [];
  selectedIndex = 0;
  orientation: any = 'horizontal';

  currentRoute: string;
  userId: string | null = null;
  tabdataavailable = false;

  routerSubscription!: Subscription;
  screenSubscription!: Subscription;
  applyButtonSubscription!: Subscription;

  private readonly routes: Record<number, string> = {
    1: '/Main-Dashboard',
    2: '/Finance-Dashboard',
    3: '/Auth-Dashboard-Production',
    4: '/Auth-Dashboard-Operation',
    6: '/Revenue-Dashboard',
    7: '/Ceo-Dashboard',
    8: '/E&M-Dashboard',
    9: '/Footfall-Dashboard',
  };

  constructor(
    public service: DataService,
    private screen: ScreenService,
    private router: Router,
    public appInfo: AppInfoService,
    private route: ActivatedRoute,
  ) {
    this.currentRoute = this.router.url;
  }

  //=================== On Init ===================
  ngOnInit(): void {
    this.loadTabData();
  }

  //=================== Load Tab Data ===================
  loadTabData(): void {
    this.route.queryParams.subscribe({
      next: (params: Params) => {
        const queryUserId = params['userId'];

        this.userId =
          queryUserId && queryUserId !== 'undefined'
            ? queryUserId
            : sessionStorage.getItem('paramsid');

        if (!this.userId) {
          return;
        }

        sessionStorage.setItem('paramsid', this.userId);

        this.handleLoginSession();
        this.fetchDashboardTabs();
      },
      error: (err) => {
        console.error('Query params error:', err);
      },
    });
  }

  //=================== Login Session ===================
  private handleLoginSession(): void {
    const paramsId = sessionStorage.getItem('paramsid');
    const sessionId = sessionStorage.getItem('SessionID');

    // Skip login if already exists
    if (paramsId && sessionId) {
      return;
    }

    this.service.dashboard_Params_Demo_Login(this.userId, '').subscribe({
      next: (res: any) => {
        console.log('Login API called');

        if (res?.SessionID) {
          sessionStorage.setItem('SessionID', res.SessionID);
        }
      },
      error: (err) => {
        console.error('Login API error:', err);
      },
    });
  }

  //=================== Fetch Tabs ===================
  private fetchDashboardTabs(): void {
    this.service.fetch_tab_Data_mainLayout().subscribe({
      next: (response: any) => {
        if (response?.flag !== '1') {
          this.tabdataavailable = false;
          return;
        }

        console.log('Dashboard data fetched successfully:', response);

        this.tabs = response?.dashboards || [];
        this.tabdataavailable = this.tabs.length > 0;

        if (this.tabdataavailable) {
          this.selectedIndex = 0;
          this.navigateToDashboard(this.tabs[0].ID);
        }
      },
      error: (err) => {
        console.error('Dashboard fetch error:', err);
        this.tabdataavailable = false;
      },
    });
  }

  //=================== Navigate Dashboard ===================
  navigateToDashboard(dashboardId: number): void {
    const route = this.routes[dashboardId];

    if (route) {
      this.router.navigate([route]);
    } else {
      console.warn('No matching dashboard path found.');
    }
  }

  //=================== Tab Change ===================
  onTabChanged(event: any): void {
    const dashboardId = event?.itemData?.ID;

    if (dashboardId) {
      this.navigateToDashboard(dashboardId);
    }
  }

  //=================== Current URL Segment ===================
  getCurrentSegmentFromUrl(): string {
    return window.location.href.split('/').pop()?.split('?')[0] || '';
  }

  //=================== Destroy ===================
  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.screenSubscription?.unsubscribe();
    this.applyButtonSubscription?.unsubscribe();
  }

  //=================== Drawer Update ===================
  updateDrawer(): void {
    const isXSmall = this.screen.sizes['screen-x-small'];
    const isLarge = this.screen.sizes['screen-large'];

    this.menuMode = isLarge ? 'shrink' : 'overlap';
    this.menuRevealMode = isXSmall ? 'slide' : 'expand';
    this.minMenuSize = isXSmall ? 0 : 48;
    this.shaderEnabled = !isLarge;
  }

  //=================== Getters ===================
  get hideMenuAfterNavigation(): boolean {
    return this.menuMode === 'overlap' || this.temporaryMenuOpened;
  }

  get showMenuAfterClick(): boolean {
    return !this.menuOpened;
  }

  //=================== Navigation Change ===================
  navigationChanged(event: DxTreeViewTypes.ItemClickEvent): void {
    const path = (event.itemData as any)?.path;
    const pointerEvent = event.event;

    if (!path || !this.menuOpened) {
      pointerEvent?.preventDefault();
      return;
    }

    if (event.node?.selected) {
      pointerEvent?.preventDefault();
    } else {
      this.router.navigate([path]);
    }

    if (this.hideMenuAfterNavigation) {
      this.temporaryMenuOpened = false;
      this.menuOpened = false;
      pointerEvent?.stopPropagation();
    }
  }

  //=================== Navigation Click ===================
  navigationClick(): void {
    if (!this.showMenuAfterClick) {
      return;
    }

    this.temporaryMenuOpened = true;
    this.menuOpened = true;
  }
}

@NgModule({
  imports: [
    RouterModule,
    SideNavigationMenuModule,
    DxDrawerModule,
    AppHeaderModule,
    CommonModule,
    DxTabPanelModule,
    DxTabsModule,
    EmptyDashboardMessageModule,
  ],
  exports: [SideNavOuterToolbarComponent],
  declarations: [SideNavOuterToolbarComponent],
})
export class SideNavOuterToolbarModule {}
