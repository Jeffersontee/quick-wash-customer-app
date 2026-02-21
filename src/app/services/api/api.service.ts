import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  get(url, data?) {
    return this.http.get<any>(environment.serverBaseUrl + url, { params: data });
  }

  post(url, data, formData = false) {
    if(!formData) {
      data = new HttpParams({
        fromObject: data
      });
    }
    return this.http.post<any>(environment.serverBaseUrl + url, data);
  }

  put(url, data, formData = false) {
    if(!formData) {
      data = new HttpParams({
        fromObject: data
      });
    }
    return this.http.put<any>(environment.serverBaseUrl + url, data);
  }

  patch(url, data, formData = false) {
    if(!formData) {
      data = new HttpParams({
        fromObject: data
      });
    }
    return this.http.patch<any>(environment.serverBaseUrl + url, data);
  }

  delete(url) {
    return this.http.delete<any>(environment.serverBaseUrl + url);
  }
}
