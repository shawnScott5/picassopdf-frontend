import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../core/model/common.model';
import { ApiEndpoint } from '../core/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  baseURL: string = "http://localhost:3000/api/subscribe";
  //baseURL: string = "https://distros-8f63ee867795.herokuapp.com/api/subscribe";

  constructor(
    private HttpClient: HttpClient
  ) { }

  fetchAllProductIds(query: any) {
    let queryParams: string = this.toQueryString(query);
    return this.HttpClient.get(`${this.baseURL}?${queryParams}`);
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
