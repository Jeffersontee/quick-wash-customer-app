import { lastValueFrom } from 'rxjs';
import { City } from './../../interfaces/city.interface';
import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  constructor(
    private api: ApiService
  ) { }

  async addCity(formData) {
    try {
      const data: City = await lastValueFrom(this.api.post('city/create', formData, true));
      return data;
    } catch(e) {
      throw(e);
    }
  }

  async getCities() {
    try {
      const data: City[] = await lastValueFrom(this.api.get('city/cities'));
      return data;
    } catch(e) {
      throw(e);
    }
  }
}
