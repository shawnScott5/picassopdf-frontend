import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { map } from 'rxjs/operators';
import { ApiResponse, LoginPayLoad, RegisterPayLoad, User } from "../model/common.model";
import { ApiEndpoint, LocalStorage } from "../constants/constants"
import { Router } from "@angular/router";
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    // Check if the user is logged in based on localStorage
    get isLoggedIn(): boolean {
        const token = localStorage.getItem(LocalStorage.token);
        return token ? true : false;
    }
    router = inject(Router);
    //baseURL: string = "http://localhost:3000/api/users";
    baseURL: string = 'https://api.picassopdf.com';
    
    constructor(private _http: HttpClient) {

    }

    register(payload: RegisterPayLoad) {
        return this._http.post<ApiResponse<User>>(`${ApiEndpoint.Auth.Register}`,
            payload
        );
    }

    updateViewCount(payload: any) {
        return this._http.patch<ApiResponse<User>>(`${ApiEndpoint.Auth.UpdateViewCount}`,
            payload
        );
    }

    resetViewCount(payload: any) {
        return this._http.patch<ApiResponse<User>>(`${ApiEndpoint.Auth.ResetViewCount}`,
            payload
        );
    }

    updateRevenue(payload: RegisterPayLoad) {
        return this._http.patch<ApiResponse<User>>(`${ApiEndpoint.Auth.UpdateRevenue}`,
            payload
        );
    }

    updateAvatar(payload: any) {
        return this._http.patch<ApiResponse<User>>(`${ApiEndpoint.Auth.UpdateAvatar}`,
            payload
        );
    }

    getUserToken() {
        const token = localStorage.getItem(LocalStorage.token);
        return token ? token : '';
    }

    login(payload: LoginPayLoad) {
        return this._http
        .post<ApiResponse<User>>(`${ApiEndpoint.Auth.Login}`, payload)
            .pipe(
                map((response: any) => {
                    if(response.status && response.data.token) {
                        localStorage.setItem(LocalStorage.token, response.data.token);
                    }
                    return response;
                })
            );
    }

    me() {
        return this._http.get<ApiResponse<User>>(`${ApiEndpoint.Auth.Me}`);
    }

    fetchMyMatches(query: any) {
        let queryParams: string = this.toQueryString(query);
        return this._http.get(`${this.baseURL}?${queryParams}`);
    }

    logout() {
        localStorage.removeItem(LocalStorage.token);
        this.router.navigate(['/login']);
    }

    forgotPassword(payload: string) {
        return this._http
        .post<ApiResponse<User>>(`${ApiEndpoint.Auth.ForgotPassword}`, payload)
            .pipe(
                map((response: any) => {
                    return response;
                })
            );
    }

    resetPassword(payload: Object) {
        return this._http
        .post<ApiResponse<User>>(`${ApiEndpoint.Auth.ResetPassword}`, payload)
            .pipe(
                map((response: any) => {
                    return response;
                })
            );
    }

    inviteUser(organizationId: string, userData: any) {
        return this._http.post(`${ApiEndpoint.Organizations.InviteUser}/${organizationId}/invite`, userData);
    }

    getOrganizationMembers(organizationId: string) {
        return this._http.get(`${ApiEndpoint.Organizations.GetMembers}/${organizationId}/members`);
    }

    toQueryString(paramsObject: any): string {
    let result: string = '';

    if (paramsObject) {
      result = Object
        .keys(paramsObject)
        .map((key: string) => {
          if(Array.isArray(paramsObject[key])) {
            return paramsObject[key].map((innerKey: string) => `${encodeURIComponent(key)}=${encodeURIComponent(innerKey)}`)
              .join('&');
          } else {
            return `${encodeURIComponent(key)}=${encodeURIComponent(paramsObject[key])}`;
          }
        })
        .join('&');
    }

    return result;
  }
}