import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, RegisterPayLoad } from '../core/model/common.model';
import { ApiEndpoint } from '../core/constants/constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  //baseURL: string = "http://localhost:3000/api/admin";
  baseURL: string = 'https://api.picassopdf.com/api';

  constructor(private _http: HttpClient) { }

  testImportFile(data: any) {
    const obj = { data: data, category: data.category}
    return this._http.post<ApiResponse<any>>(`${ApiEndpoint.Admin.TestImportFile}`,
      obj
    );
  }

  updateInfluencersInDB(payload: RegisterPayLoad) {
    return this._http.put<ApiResponse<any>>(`${ApiEndpoint.Admin.UpdateInfluencersInDB}`,
        payload
    );
  }

 addInfluencersToDB(payload: RegisterPayLoad) {
    return this._http.put<ApiResponse<any>>(`${ApiEndpoint.Admin.AddInfluencersToDB}`,
        payload
    );
  }

  updateTask(query: any) {
    console.log('payload:', query)
    return this._http.patch<ApiResponse<any>>(`${ApiEndpoint.Tasks.UpdateTask}`,
        query
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
