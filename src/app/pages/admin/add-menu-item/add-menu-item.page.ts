import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MenuService } from './../../../services/menu/menu.service';
import { CategoryService } from './../../../services/category/category.service';
import { RestaurantService } from './../../../services/restaurant/restaurant.service';
import { GlobalService } from './../../../services/global/global.service';
import { Category } from './../../../models/category.model';
import { Restaurant } from './../../../models/restaurant.model';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-menu-item',
  templateUrl: './add-menu-item.page.html',
  styleUrls: ['./add-menu-item.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddMenuItemPage implements OnInit {

  @ViewChild('filePicker', {static: false}) filePickerRef: ElementRef;
  restaurants: Restaurant[] = [];
  categories: Category[] = [];
  isLoading: boolean = false;
  veg = true;
  status = true;
  image: any;
  imageFile: any;

  constructor(
    private global: GlobalService,
    private restaurantService: RestaurantService,
    private categoryService: CategoryService,
    private menuService: MenuService
  ) { }

  ngOnInit() {
    this.getRestaurants();
  }

  async getRestaurants() {
    try {
      this.global.showLoader();
      this.restaurants = await this.restaurantService.getRestaurants();
      console.log(this.restaurants);
      this.global.hideLoader();
    } catch(e) {
      this.global.hideLoader();
      this.global.errorToast();
    }
  }

  async changeRestaurant(event) {
    console.log(event);
    this.categories = [];
    try {
      this.global.showLoader();
      this.categories = await this.categoryService.getRestaurantCategories(event.detail.value);
      console.log(this.categories);
      this.global.hideLoader();
    } catch(e) {
      this.global.hideLoader();
      this.global.errorToast();
    }
  }

  changeImage() {
    this.filePickerRef.nativeElement.click();
  }

  onFileChosen(event) {
    const file = event.target.files[0];
    if(!file) return;
    console.log('file: ', file);
    this.imageFile = file;
    const reader = new FileReader();
    console.log(reader);
    reader.onload = () => {
      const dataUrl = reader.result.toString();
      this.image = dataUrl;
      console.log('image: ', this.image);
    }
    reader.readAsDataURL(file);
  }

  async onSubmit(form: NgForm) {
    if(!form.valid) return;
    console.log(form.value);
    let postData = new FormData();
    if(!this.image || this.image == '') {
      this.global.errorToast('Please select Item image');
      return;
    }
    if(form.value.description) {
      postData.append('description', form.value.description);
    }
    postData.append('itemImages', this.imageFile, this.imageFile.name);
    postData.append('name', form.value.name);
    postData.append('restaurant_id', form.value.restaurant_id);
    postData.append('category_id', form.value.category_id);
    postData.append('price', (form.value.price).toString());
    postData.append('veg', this.veg.toString());
    postData.append('status', this.status.toString());
    try {
      this.global.showLoader();
      const response = await this.menuService.addMenuItem(postData);
      console.log(response);
      this.global.successToast('Menu item added successfully');
      this.global.hideLoader();
    } catch(e) {
      console.log(e);
      this.global.hideLoader();
      this.global.errorToast();
    }
  }

}