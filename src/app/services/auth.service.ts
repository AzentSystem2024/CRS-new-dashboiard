import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  Params,
  ActivatedRoute,
} from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { CustomReuseStrategy } from '../State-Management/custom-reuse-strategy';
import { CRS_DASHBOARD_LOGOUT } from 'src/constants/constantURl';
import { HttpClient } from '@angular/common/http';
export interface IUser {
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface IResponse {
  isOk: boolean;
  data?: IUser;
  message?: string;
}

const defaultPath = '/';
export const defaultUser: IUser = {
  email: 'azentdeveloper@dx-email.com',
  name: 'Azent Developer',
  avatarUrl:
    'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/01.png',
};

@Injectable()
export class AuthService {
  private loggedInSource = new BehaviorSubject<boolean>(false);
  loggedIn$ = this.loggedInSource.asObservable();

  private _user: IUser | null = defaultUser;

  get loggedIn(): boolean {
    return !!this._user;
  }

  private _lastAuthenticatedPath: string = defaultPath;

  set lastAuthenticatedPath(value: string) {
    this._lastAuthenticatedPath = value;
  }

  constructor(
    private router: Router,
    private customReuse: CustomReuseStrategy,
    private http: HttpClient
  ) {}

  async logIn(email: string, password: string) {
    try {
      // Send request
      this._user = { ...defaultUser, email };
      this.router.navigate([this._lastAuthenticatedPath]);

      return {
        isOk: true,
        data: this._user,
      };
    } catch {
      return {
        isOk: false,
        message: 'Authentication failed',
      };
    }
  }

  async getUser() {
    try {
      // Send request

      return {
        isOk: true,
        data: this._user,
      };
    } catch {
      return {
        isOk: false,
        data: null,
      };
    }
  }

  async createAccount(email: string, password: string) {
    try {
      // Send request

      this.router.navigate(['/auth/create-account']);
      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to create account',
      };
    }
  }

  async changePassword(email: string, recoveryCode: string) {
    try {
      // Send request

      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to change password',
      };
    }
  }

  async resetPassword(email: string) {
    try {
      // Send request

      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to reset password',
      };
    }
  }

  // async logOut() {
  //   sessionStorage.clear();
  //   this.customReuse.clearStoredData();
  //   this.router.navigate(['/auth/login']);
  // }

  logOut() {
    const API_URL = CRS_DASHBOARD_LOGOUT;
    // const UserID = sessionStorage.getItem('paramsid');
    const UserID = sessionStorage.getItem('userID');
    const sessionID = sessionStorage.getItem('SessionID');
    const reqBody = { UserID: UserID, SessionID: sessionID };
    return this.http.post(API_URL, reqBody);
  }
}

@Injectable()
export class AuthGuardService implements CanActivate {
  sessionUserId: any;
  paramsUserId: any;
  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  canActivate(): Observable<boolean> {
    return this.route.queryParams.pipe(
      map((params: Params) => {
        let userId = params['userId'];

        if (userId) {
          console.log('UserId found:', userId);
          sessionStorage.setItem('paramsid', userId);
          return true;
        } else {
          console.warn('No userId found. Redirecting to login.');
          this.router.navigate(['/auth/login']);
          return false;
        }
      })
    );
  }
}
