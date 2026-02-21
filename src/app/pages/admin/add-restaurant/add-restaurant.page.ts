import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { City } from './../../../interfaces/city.interface';
import { CityService } from './../../../services/city/city.service';
import { SearchLocationComponent } from 'src/app/components/search-location/search-location.component';
import { NgForm } from '@angular/forms';
import { GlobalService } from 'src/app/services/global/global.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';

@Component({
  selector: 'app-add-restaurant',
  templateUrl: './add-restaurant.page.html',
  styleUrls: ['./add-restaurant.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddRestaurantPage implements OnInit {

  isLoading: boolean = false;
  coverImage: any;
  cities: City[] = [];
  location: any = {};
  category: string;
  isCuisine: boolean = false;
  cuisines: any[] = [];
  categories: any[] = [];
  cover_file: any;

  constructor(
    private restaurantService: RestaurantService,
    private global: GlobalService,
    private city: CityService,
  ) { }

  ngOnInit() {
    this.getCities();
  }

  async getCities() {
    try {
      this.cities = await this.city.getCities();
      console.log(this.cities);
    } catch(e) {
      console.log(e);
      this.global.errorToast(e);
    }
  }

  async searchLocation() {
    try {
      const options = {
        component: SearchLocationComponent
      };
      const modal = await this.global.createModal(options);
      if(modal) {
        console.log(modal);
        this.location = modal;
      }
    } catch(e) {
      console.log(e);
    }
  }

  addCategory() {
    console.log(this.category);
    if(this.category.trim() == '') return;
    console.log(this.isCuisine);
    const checkString = this.categories.find(x => x == this.category);
    if(checkString) {
      this.global.errorToast('Category already added');
      return;
    }
    this.categories.push(this.category);
    if(this.isCuisine) this.cuisines.push(this.category);
  }

  clearCategory() {
    this.categories = [];
    this.cuisines = [];
  }

  getArrayAsString(array) {
    return array.join(', ');
  }

  preview(event) {
    console.log(event);
    const files = event.target.files;
    if(files.length == 0) return;
    const mimeType = files[0].type;
    if(mimeType.match(/image\/*/) == null) return;
    const file = files[0];
    this.cover_file = file;
    // const filePath = 'restuarants/' + Date.now() + '_' + file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('result: ', reader.result);
      this.coverImage = reader.result;
    }
    reader.readAsDataURL(file);
  }

  async onSubmit(form: NgForm) {
    if(!form.valid || !this.location?.lat) return;
    let postData = new FormData();
    if(!this.coverImage || this.coverImage == '') {
      this.global.errorToast('Please select a cover image');
      return;
    }
    if(form.value.description) {
      postData.append('description', form.value.description);
    }
    postData.append('restaurantImages', this.cover_file, this.cover_file.name);
    postData.append('name', form.value.name);
    postData.append('email', form.value.email);
    postData.append('phone', form.value.phone);
    postData.append('password', form.value.password);
    postData.append('res_name', form.value.res_name);
    // postData.append('short_name', (form.value.res_name).toLowerCase());
    postData.append('openTime', form.value.openTime);
    postData.append('closeTime', form.value.closeTime);
    postData.append('price', (form.value.price).toString());
    postData.append('city_id', form.value.city);
    postData.append('delivery_time', (form.value.delivery_time).toString());
    postData.append('address', this.location.address);
    postData.append('status', 'active');
    postData.append('cuisines', JSON.stringify(this.cuisines));
    postData.append('categories', JSON.stringify(this.categories));
    const location = {
      type: 'Point',
      coordinates: [this.location.lng, this.location.lat]
    };
    postData.append('location', JSON.stringify(location));
    try {
      this.global.showLoader();
      const response = await this.restaurantService.addRestaurant(postData);
      console.log(response);
      this.global.successToast('Restaurant added successfully');
      this.global.hideLoader();
    } catch(e) {
      console.log(e);
      this.global.hideLoader();
      this.global.errorToast();
    }
  }

}