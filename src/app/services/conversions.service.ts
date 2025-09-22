import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConversionsService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Get all conversions for the current user/company
  getConversions(params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/conversions`, { params });
  }

  // Get conversions by date range (for dashboard)
  getConversionsByDateRange(startDate: string, endDate: string): Observable<any> {
    const params = {
      limit: '1000' // Get up to 1000 records for the last 90 days
    };
    return this.http.get<any>(`${this.apiUrl}/conversions`, { params });
  }
}
