import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CustomSubscriptionRequest {
  credits: number;
  userId: string | null;
  price: number;
  customerEmail?: string | null;
}

export interface StripeSessionResponse {
  session: {
    id: string;
    url: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StripeCustomService {
  //private baseURL = 'https://distros-8f63ee867795.herokuapp.com/api/subscribe-stripe-custom';
  // For local development, uncomment the line below and comment the line above
  private baseURL = 'http://localhost:3000/api/subscribe-stripe-custom';

  constructor(private http: HttpClient) { }

  createCustomSubscription(request: CustomSubscriptionRequest): Observable<StripeSessionResponse> {
    return this.http.post<StripeSessionResponse>(this.baseURL, request);
  }

  getSubscriptionDetails(sessionId: string, user: any): Observable<any> {
    return this.http.post(`${this.baseURL}/details`, { sessionId, user });
  }

  cancelSubscription(subscriptionId: string, userId: string): Observable<any> {
    return this.http.post(`${this.baseURL}/cancel`, { subscriptionId, userId });
  }
}
