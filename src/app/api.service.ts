import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './core/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  getData() {
    return this.http.get(`${this.apiConfig.apiUrl}/`);
  }

  // HTTP GET method
  get(endpoint: string): Observable<any> {
    return this.http.get(`${this.apiConfig.apiUrl}${endpoint}`);
  }

  // HTTP POST method
  post(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.apiConfig.apiUrl}${endpoint}`, data);
  }

  // HTTP PUT method
  put(endpoint: string, data: any): Observable<any> {
    return this.http.put(`${this.apiConfig.apiUrl}${endpoint}`, data);
  }

  // HTTP DELETE method
  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.apiConfig.apiUrl}${endpoint}`);
  }

  // HTTP PATCH method
  patch(endpoint: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiConfig.apiUrl}${endpoint}`, data);
  }
}