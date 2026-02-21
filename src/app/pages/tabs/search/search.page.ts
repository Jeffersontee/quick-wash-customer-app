import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Restaurant } from 'src/app/models/restaurant.model';
import { AddressService } from 'src/app/services/address/address.service';
// import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { RestaurantComponent } from 'src/app/components/restaurant/restaurant.component';
import { LoadingRestaurantComponent } from 'src/app/components/loading-restaurant/loading-restaurant.component';
import { EmptyScreenComponent } from 'src/app/components/empty-screen/empty-screen.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, RestaurantComponent, LoadingRestaurantComponent, EmptyScreenComponent]
})
export class SearchPage implements OnInit, OnDestroy {

  @ViewChild('searchInput') sInput;
  model: any = {
    icon: 'search-outline',
    title: 'No Restaurants Record Found'
  };
  isLoading: boolean;
  query: any;
  restaurants: Restaurant[] = [];
  location: any = {};
  addressSub: Subscription;
  data: any;
  page = 1;

  constructor(
    private addressService: AddressService,
    private global: GlobalService,
    private restaurantService: RestaurantService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.sInput.setFocus();
    }, 500);
    this.addressSub = this.addressService.addressChange.subscribe(address => {
      if(address && address?.lat) this.location = address;
      console.log(this.location);
    });
  }

  async onSearchChange(event) {
    console.log(event.detail.value);
    this.query = event.detail.value.toLowerCase();
    this.restaurants = [];
    if(this.query.length > 0) {
      this.isLoading = true;
      // setTimeout(async() => {
      //   this.restaurants = await this.allRestaurants.filter((element: any) => {
      //     return element.short_name.includes(this.query);
      //   });
      //   console.log(this.restaurants);
      //   this.isLoading = false;
      // }, 3000);
      try {
        if(this.location && this.location?.lat) {
          const radius = this.addressService.radius;
          const data = {
            lat: this.location.lat,
            lng: this.location.lng,
            radius,
            name: this.query
          };
          this.data = await this.restaurantService.searchNearbyRestaurants(data);
          console.log('nearby searched restaurants: ', this.data);
          if(this.data) this.restaurants = this.restaurants.concat(this.data?.restaurants);
          console.log('restaurants: ', this.restaurants);
        } else {
          this.global.errorToast('Please select your location to proceed with the search...');
        }
        this.isLoading = false;
      } catch(e) {
        this.isLoading = false;
        this.global.checkMessageForErrorToast(e);
        // let msg;
        // if(e?.error?.message) {
        //   msg = e.error.message;
        // }
        // this.global.errorToast(msg);
      }
    }
  }

  async loadMore(event) {
    console.log(event);
    try {
      this.page++;
      // call functionality within settimeout of 2 secs for showing loader properly
      setTimeout(async() => {
        const perPage = this.data.perPage;
        const nextPage = this.data.nextPage;
        if(nextPage) {
          const radius = this.addressService.radius;
          const data = {
            lat: this.location.lat,
            lng: this.location.lng,
            radius,
            name: this.query,
            page: this.page
          };
          this.data = await this.restaurantService.searchNearbyRestaurants(data);
          if(this.data) this.restaurants = this.restaurants.concat(this.data?.restaurants);
          console.log(this.data);
        }
        console.log(this.restaurants);
        event.target.complete();
        // if(this.data?.nextPage) event.target.disabled = true;
        if(this.data?.restaurants?.length < perPage) {
          this.global.infoToast('Wow! All Restaurants Fetched Successfully. No more restaurants left...');
          event.target.disabled = true
        };
      }, 2000);
    } catch(e) {
      this.global.checkMessageForErrorToast(e);
      // let msg;
      // if(e?.error?.message) {
      //   msg = e.error.message;
      // }
      // this.global.errorToast(msg);
    }
  }

  ngOnDestroy() {
      if(this.addressSub) this.addressSub.unsubscribe();
  }

}