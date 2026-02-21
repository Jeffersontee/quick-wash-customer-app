import { lastValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { Injectable } from '@angular/core';
import { Banner } from 'src/app/interfaces/banner.interface';

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  constructor(
    private api: ApiService
  ) { }

  async addBanner(formData) {
    try {
      const data: Banner = await lastValueFrom(this.api.post('banner/create', formData, true));
      return data;
    } catch(e) {
      throw(e);
    }
  }

  async getBanners() {
    try {
      const data: Banner[] = await lastValueFrom(this.api.get('banner/banners'));
      return data;
    } catch(e) {
      throw(e);
    }
  }
}
