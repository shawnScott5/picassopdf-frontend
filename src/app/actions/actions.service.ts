import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, RegisterPayLoad } from '../core/model/common.model';
import { ApiEndpoint } from '../core/constants/constants';
import { ApiConfigService } from '../core/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ActionsService {

  constructor(
    private _http: HttpClient,
    private apiConfig: ApiConfigService
  ) { }

  convertToPDF(payload: any) {
    console.log('PAYLOAD:', payload);
    return this._http.post<ApiResponse<any>>(`${ApiEndpoint.PDF.convertToPDF}`,
        payload
    );
  }

  createNote(payload: RegisterPayLoad) {
    console.log(payload)
    return this._http.post<ApiResponse<any>>(`${ApiEndpoint.Actions.CreateNote}`,
        payload
    );
  }

  sendFeatureSuggestion(payload: RegisterPayLoad) {
    return this._http.post<ApiResponse<any>>(`${ApiEndpoint.Actions.FeatureSuggestion}`,
        payload
    );
  }

  sendBug(payload: RegisterPayLoad) {
    return this._http.post<ApiResponse<any>>(`${ApiEndpoint.Actions.ReportBug}`,
        payload
    );
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
