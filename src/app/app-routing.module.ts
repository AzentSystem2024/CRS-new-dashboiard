import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { AuthGuardService } from './services';
import {
  SideNavOuterToolbarComponent,
  UnauthenticatedContentComponent,
} from './layouts';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MainHomePageComponent } from './pages/Denial-Dashboard-page/main-home-page.component';
import { AuthDashboardPageComponent } from './pages/auth-dashboard-production/auth-dashboard-page.component';
import { FinanceDashboardComponent } from './pages/finance-dashboard/finance-dashboard.component';
import { EmptyDashboardMessageComponent } from './pages/empty-dashboard-message/empty-dashboard-message.component';
import { AuthDashboardOperationComponent } from './pages/auth-dashboard-operation/auth-dashboard-operation.component';
import { RevenueDashboardPageComponent } from './pages/revenue-dashboard-page/revenue-dashboard-page.component';
import { CeoDashboardPageComponent } from './pages/ceo-dashboard-page/ceo-dashboard-page.component';
import { EandMDashboardPageComponent } from './pages/E&M-dashboard-page/e&m-dashboard-page.component';
import { ChangePasswordFormComponent } from './components';
import { FootfallDashboardComponent } from './pages/footfall-dashboard/footfall-dashboard.component';
const routes: Routes = [
  {
    path: 'auth',
    component: UnauthenticatedContentComponent,
    children: [
      {
        path: 'login',
        component: LoginPageComponent,
      },
    ],
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: SideNavOuterToolbarComponent,
    // canActivate: [AuthGuardService],
    children: [
      {
        path: 'Main-Dashboard',
        component: MainHomePageComponent,
      },
      {
        path: 'Auth-Dashboard-Production',
        component: AuthDashboardPageComponent,
      },
      {
        path: 'Auth-Dashboard-Operation',
        component: AuthDashboardOperationComponent,
      },
      {
        path: 'Finance-Dashboard',
        component: FinanceDashboardComponent,
      },
      {
        path: 'Revenue-Dashboard',
        component: RevenueDashboardPageComponent,
      },
      {
        path: 'Ceo-Dashboard',
        component: CeoDashboardPageComponent,
      },
      {
        path: 'E&M-Dashboard',
        component: EandMDashboardPageComponent,
      },
      {
        path: 'Footfall-Dashboard',
        component: FootfallDashboardComponent,
      },
      {
        path: 'Empty-message-page',
        component: EmptyDashboardMessageComponent,
      },
      {
        path: 'change-password',
        component: ChangePasswordFormComponent,
      },
      {
        path: '**',
        redirectTo: 'Empty-message-page',
        pathMatch: 'full',
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true }), BrowserModule],
  providers: [AuthGuardService],
  exports: [RouterModule],
  declarations: [],
})
export class AppRoutingModule {}
