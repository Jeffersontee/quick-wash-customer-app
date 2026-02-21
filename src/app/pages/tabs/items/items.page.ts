import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GlobalService } from './../../../services/global/global.service';
import { MenuService } from './../../../services/menu/menu.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart/cart.service';
// import { take } from 'rxjs/operators';
import { Restaurant } from 'src/app/models/restaurant.model';
import { Category } from 'src/app/models/category.model';
import { Item } from 'src/app/models/item.model';
import { Cart } from 'src/app/interfaces/cart.interface';
import { LoadingRestaurantComponent } from 'src/app/components/loading-restaurant/loading-restaurant.component';
import { EmptyScreenComponent } from 'src/app/components/empty-screen/empty-screen.component';
import { RestaurantDetailComponent } from 'src/app/components/restaurant-detail/restaurant-detail.component';
import { ItemComponent } from 'src/app/components/item/item.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule,
    FormsModule, 
    LoadingRestaurantComponent,
    EmptyScreenComponent,
    RestaurantDetailComponent,
    ItemComponent
  ]
})
export class ItemsPage implements OnInit, OnDestroy {

  id: string;
  data = {} as Restaurant;
  items: Item[] = [];
  veg: boolean = false;
  isLoading: boolean;
  cartData = {} as Cart;
  storedData = {} as Cart;
  model = {
    icon: 'fast-food-outline',
    title: 'No Menu Available'
  };
  // restaurants: any[] = [];  
  categories: Category[] = [];
  allItems: Item[] = [];
  cartSub: Subscription;
  // routeSub: Subscription;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private menuService: MenuService,
    private global: GlobalService
  ) { }

  ngOnInit() {    
    // this.route.paramMap.pipe(take(1)).subscribe(paramMap => {
    //   console.log('route data: ', paramMap);
    //   if(!paramMap.has('restaurantId')) {
    //     this.navCtrl.back();
    //     return;
    //   }
    //   this.id = paramMap.get('restaurantId');
    //   console.log('id: ', this.id);
    // });
    const id = this.route.snapshot.paramMap.get('restaurantId');
    console.log('check id: ', id);
    if(!id) {
      this.navCtrl.back();
      return;
    }
    this.id = id;
    console.log('id: ', this.id);
    
    this.cartSub = this.cartService.cart.subscribe(cart => {
      console.log('cart items: ', cart);
      this.cartData = {} as Cart;
      this.storedData = {} as Cart
      if(cart && cart?.totalItem > 0) {
        this.storedData = cart;
        // this.cartData.items = this.storedData.items;
        this.cartData.totalItem = this.storedData.totalItem;
        this.cartData.totalPrice = this.storedData.totalPrice;
        
        console.log('allItems updated quantity: ', this.allItems);
        if(cart?.restaurant?._id === this.id) {
          this.allItems.forEach(element => {
            let qty = false;
            cart.items.forEach(element2 => {
              if(element._id != element2._id) return;
              element.quantity = element2.quantity;
              qty = true;
            });
            if(!qty && element.quantity) element.quantity = 0;
          });
          console.log('allitems: ', this.allItems);
          this.cartData.items = this.allItems.filter(x => x.quantity > 0);
          if(this.veg == true) this.items = this.allItems.filter(x => x.veg === true);
          else this.items = [...this.allItems];
        } else {
          this.allItems = this.allItems.map(element => {  
            return { ...element, quantity: 0 };
          });
          if(this.veg == true) this.items = this.allItems.filter(x => x.veg === true);
          else this.items = [...this.allItems];
        }
      } 
      
    });    
    this.getItems();
  }

  async getItems() {
    try {      
      this.isLoading = true;
      this.data = {} as Restaurant;
      this.cartData = {} as Cart;
      this.storedData = {} as Cart;
      const data: any = await this.menuService.getMenuItems(this.id);
      if(data) {
        this.data = {...data?.restaurant};
        this.categories = [...data.categories];
        this.allItems = [...data.items];
        this.items = [...this.allItems];
        console.log('categories: ', this.categories);
        console.log('items: ', this.items);
        console.log('restaurant: ', this.data);
        await this.cartService.getCartData();
      }
      this.isLoading = false;
    } catch(e) {
      this.isLoading = false;
      console.log(e);
      this.global.checkMessageForErrorToast(e);
      // let msg;
      // if(e?.error?.message) {
      //   msg = e.error.message;
      // }
      // this.global.errorToast(msg);
    }
  }

  vegOnly(event) {
    console.log(event.detail.checked);
    this.items = [];
    if(event.detail.checked == true) this.items = this.allItems.filter(x => x.veg === true);
    else this.items = this.allItems;
    console.log('items: ', this.items);
  }

  quantityPlus(item) {
    const index = this.allItems.findIndex(x => x._id === item._id);
    console.log(index);
    if(!this.allItems[index].quantity || this.allItems[index].quantity == 0) {
      if(!this.storedData.restaurant || (this.storedData.restaurant && this.storedData.restaurant._id == this.id)) {
        console.log('index item: ', this.allItems);
        this.cartService.quantityPlus(index, this.allItems, this.data);
      } else {
        // alert for clear cart
        this.cartService.alertClearCart(index, this.allItems, this.data);
      }
    } else {
      this.cartService.quantityPlus(index, this.allItems, this.data);
    }  
  }

  quantityMinus(item) {
    const index = this.allItems.findIndex(x => x._id === item._id);
    this.cartService.quantityMinus(index, this.allItems);
  }

  checkItemCategory(id) {
    const item = this.items.find(x => x.category_id == id);
    if(item) return true;
    return false;
  }

  saveToCart() {
    try {
      this.cartData.restaurant = {} as Restaurant;
      this.cartData.restaurant = this.data;
      console.log('save cartData: ', this.cartData);
      this.cartService.saveCart();
    } catch(e) {
      console.log(e);
    }
  }

  async viewCart() {
    console.log('save cartdata: ', this.cartData);
    if(this.cartData.items && this.cartData.items.length > 0) await this.saveToCart();
    console.log('router url: ', this.router.url);
    this.router.navigate([this.router.url + '/cart']);
  }

  async ionViewWillLeave() {
    console.log('ionViewWillLeave ItemsPage');
    if(this.cartData?.items && this.cartData?.items.length > 0) await this.saveToCart();
    // if(this.routeSub) this.routeSub.unsubscribe();
  }

  ngOnDestroy() {
    if(this.cartSub) this.cartSub.unsubscribe();
  }

}