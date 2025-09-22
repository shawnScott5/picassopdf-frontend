import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  //private apiUrl = 'http://localhost:3000'
  private apiUrl = 'https://api.picassopdf.com';

  constructor(private http: HttpClient) {}

  getData() {
    return this.http.get(`${this.apiUrl}/`);
  }

  // HTTP GET method
  get(endpoint: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${endpoint}`);
  }

  // HTTP POST method
  post(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}${endpoint}`, data);
  }

  // HTTP PUT method
  put(endpoint: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${endpoint}`, data);
  }

  // HTTP DELETE method
  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${endpoint}`);
  }

  // HTTP PATCH method
  patch(endpoint: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}${endpoint}`, data);
  }
}