// shared.service.ts
import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private userIdSubject = new BehaviorSubject<string>('');
  private reloadComponentsSource = new Subject<void>();
  reloadComponents$ = this.reloadComponentsSource.asObservable();

  private financeHomeLoaded = new BehaviorSubject<boolean>(false);
  financeHomeLoaded$ = this.financeHomeLoaded.asObservable();

  private initDataLoaded = new BehaviorSubject<boolean>(false);
  initDataLoaded$ = this.initDataLoaded.asObservable();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.route.queryParams.subscribe((params: Params) => {
      let userId = params['userId'];
      console.log('params userid fetched >>', userId);
      sessionStorage.setItem('paramsid', userId);
    });
  }

  getUserId() {
    let userId = sessionStorage.getItem('paramsid');
    return userId;
  }

  setFinanceHomeLoaded(isLoaded: boolean) {
    this.financeHomeLoaded.next(isLoaded);
  }

  setinitDataLoaded(isLoaded: boolean) {
    this.initDataLoaded.next(isLoaded);
  }

  reloadComponents() {
    this.reloadComponentsSource.next();
  }

  navigateToDashboard(dashboardText: any) {
    console.log(dashboardText, 'dashboardText');
    const routes = {
      1: '/Main-Dashboard', //denialdashboard
      2: '/Finance-Dashboard',
      3: '/Auth-Dashboard-Production',
      4: '/Auth-Dashboard-Operation',
      6: '/Revenue-Dashboard',
      7: '/Ceo-Dashboard',
      8: '/E&M-Dashboard',
    };

    for (const key in routes) {
      if (dashboardText == key) {
        this.router.navigate([routes[key]]);
        return;
      }
    }
    console.warn('No matching dashboard path found.');
  }
}
