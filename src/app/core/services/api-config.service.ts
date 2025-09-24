import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  
  constructor() { }

  get apiUrl(): string {
    return environment.apiUrl;
  }

  get pdfApiUrl(): string {
    return environment.pdfApiUrl;
  }

  get isProduction(): boolean {
    return environment.production;
  }
}
