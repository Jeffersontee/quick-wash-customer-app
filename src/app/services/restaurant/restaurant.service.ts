import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { Restaurant } from 'src/app/models/restaurant.model';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  constructor(
    private api: ApiService
  ) { }

  async addRestaurant(formData) {
    try {
      const data: Restaurant = await lastValueFrom(this.api.post('restaurant/create', formData, true));
      return data;
    } catch(e) {
      throw(e);
    }
  }

  async getRestaurants() {
    try {
      const restaurants: Restaurant[] = await lastValueFrom(this.api.get('restaurant/getRestaurants'));
      return restaurants;
    } catch(e) {
      throw(e);
    }
  }

  async getNearbyRestaurants(data: {lat: number, lng: number, radius: number, page?: number}) {
    try {
      const res_data: any = await lastValueFrom(this.api.get('restaurant/nearbyRestaurants', data));
      return res_data;
    } catch(e) {
      throw(e);
    }
  }

  async searchNearbyRestaurants(data: {lat: number, lng: number, radius: number, name: string, page?: number}) {
    try {
      const restaurants_data: any = await lastValueFrom(this.api.get('restaurant/searchNearbyRestaurants', data));
      return restaurants_data;
    } catch(e) {
      throw(e);
    }
  }
}
