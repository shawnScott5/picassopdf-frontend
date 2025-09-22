import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../core/model/common.model';

@Injectable({
  providedIn: 'root'
})
export class apiKeysService {
  //private apiUrl = 'http://localhost:3000/api';
  private apiUrl = 'https://api.picassopdf.com';

  constructor(private http: HttpClient) {}

  // Get all API keys for the current user
  getApiKeys(userParams: { userId: string; organizationId?: string }): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api-keys`, { params: userParams });
  }

  // Get all API keys (for dashboard filtering)
  getAllApiKeys(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api-keys`);
  }

  createApiKey(payload: {
    userId: string;
    organizationId?: string;
    name: string;
    description?: string;
    permissions?: string[];
    scopes?: string[];
    rateLimits?: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay: number;
      burstLimit: number;
    };
    keyPrefix?: string;
    status?: string;
    isActive?: boolean;
  }) {
    console.log('CREATING API KEY..........')
    console.log(payload)
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api-keys/create`, payload);
  }

  // Deactivate an API key
  deactivateApiKey(apiKeyId: string, userId: string): Observable<ApiResponse<any>> {
    console.log('DEACTIVATING API KEY..........', apiKeyId);
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api-keys/deactivate/${apiKeyId}`, { userId });
  }

  // Activate an API key
  activateApiKey(apiKeyId: string, userId: string): Observable<ApiResponse<any>> {
    console.log('ACTIVATING API KEY..........', apiKeyId);
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api-keys/activate/${apiKeyId}`, { userId });
  }

  // Delete an API key
  deleteApiKey(apiKeyId: string, userId: string): Observable<ApiResponse<any>> {
    console.log('DELETING API KEY..........', apiKeyId);
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/api-keys/delete/${apiKeyId}`, { 
      body: { userId } 
    });
  }

  // Check if API key name is available for the user
  checkApiKeyNameAvailability(userId: string, name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api-keys/check-name`, { 
      params: { userId, name } 
    });
  }

  // Edit an API key name and description
  editApiKey(apiKeyId: string, payload: {
    userId: string;
    name: string;
    description?: string;
  }): Observable<ApiResponse<any>> {
    console.log('EDITING API KEY..........', apiKeyId);
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api-keys/edit/${apiKeyId}`, payload);
  }

  // Regenerate an API key (new token)
  regenerateApiKey(apiKeyId: string, payload: {
    userId: string;
    name: string;
  }): Observable<ApiResponse<any>> {
    console.log('REGENERATING API KEY..........', apiKeyId);
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api-keys/regenerate/${apiKeyId}`, payload);
  }
}
