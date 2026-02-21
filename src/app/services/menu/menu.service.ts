import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { Item } from 'src/app/models/item.model';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private api: ApiService
  ) { }

  async addMenuItem(formData) {
    try {
      const data: Item = await lastValueFrom(this.api.post('item/create', formData, true));
      return data;
    } catch(e) {
      throw(e);
    }
  }

  async getMenuItems(restaurantId) {
    try {
      const data: any = await lastValueFrom(this.api.get('item/menuItems/' + restaurantId));
      return data;
    } catch(e) {
      throw(e);
    }
  }
}
