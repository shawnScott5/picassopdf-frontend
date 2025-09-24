import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ConversionsService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  // Get all conversions for the current user/company
  getConversions(params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiConfig.apiUrl}/conversions`, { params });
  }

  // Get conversions by date range (for dashboard)
  getConversionsByDateRange(startDate: string, endDate: string): Observable<any> {
    const params = {
      startDate: startDate,
      endDate: endDate,
      limit: '1000' // Get up to 1000 records for the date range
    };
    console.log('🔍 Fetching conversions with params:', params);
    return this.http.get<any>(`${this.apiConfig.apiUrl}/conversions`, { params });
  }
}
