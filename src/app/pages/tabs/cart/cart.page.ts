import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { environment } from './../../../../environments/environment';
import { NavigationExtras, Router } from '@angular/router';
import { IonContent, ModalController } from '@ionic/angular';
// import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { SearchLocationComponent } from 'src/app/components/search-location/search-location.component';
import { Address } from 'src/app/models/address.model';
import { AddressService } from 'src/app/services/address/address.service';
// import { Order } from 'src/app/models/order.model';
import { CartService } from 'src/app/services/cart/cart.service';
import { GlobalService } from 'src/app/services/global/global.service';
// import { OrderService } from 'src/app/services/order/order.service';
import { Cart } from 'src/app/interfaces/cart.interface';
import { EmptyScreenComponent } from 'src/app/components/empty-screen/empty-screen.component';
import { OtpScreenComponent } from 'src/app/components/otp-screen/otp-screen.component';
import { CartItemComponent } from 'src/app/components/cart-item/cart-item.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, EmptyScreenComponent, OtpScreenComponent, CartItemComponent]
})
export class CartPage implements OnInit, OnDestroy {

  @ViewChild('cart_otp_modal') modal: ModalController;
  @ViewChild(IonContent, {static: false}) content: IonContent;
  urlCheck: any;
  url: any;
  model = {} as Cart;
  deliveryCharge = 20;
  instruction: any;
  location = {} as Address;
  cartSub: Subscription;
  addressSub: Subscription;
  serverImageUrl = environment.serverUrl;
  verifyOtp = false;

  constructor(
    // private navCtrl: NavController,
    private router: Router,
    // private orderService: OrderService,
    private global: GlobalService,
    private cartService: CartService,
    private addressService: AddressService,
    private profileService: ProfileService
  ) { }

  async ngOnInit() {
    await this.getData();
    this.addressSub = this.addressService.addressChange.subscribe({
      next: (address) => {
        console.log('location cart: ', address);
        this.processAddressChange(address);
      }
    });
    this.cartSub = this.cartService.cart.subscribe(cart => {
      console.log('cart page: ', cart);
      this.model = cart;
      if(!this.model) this.location = {} as Address;
      console.log('cart page model: ', this.model);
    });
  }

  async processAddressChange(address) {
    this.location = address;
    console.log('location cart: ', this.location);
    if(this.location?._id && this.location?._id != '') {
      const radius = this.addressService.radius;
      const result = await this.cartService.checkCart(this.location.lat, this.location.lng, radius);
      console.log(result);
      if(result) {
        this.global.errorToast(
          'Your location is too far from the restaurant in the cart, kindly search from some other restaurant nearby.',
          5000);
        this.cartService.clearCart();
      }
    }
  }

  async getData() {
    await this.checkUrl();
    await this.cartService.getCartData();
  }

  checkUrl() {
    let url: any = (this.router.url).split('/');
    console.log('url: ', url);
    const spliced = url.splice(url.length - 2, 2); // /tabs/cart url.length - 1 - 1
    this.urlCheck = spliced[0];
    console.log('urlcheck: ', this.urlCheck);
    url.push(this.urlCheck);
    this.url = url;
    console.log(this.url);
  }

  getPreviousUrl() {
    return this.url.join('/');
  }

  quantityPlus(index) {
    this.cartService.quantityPlus(index);
  }

  quantityMinus(index) {
    this.cartService.quantityMinus(index);
  }

  addAddress(location?) {
    let url: any;
    let navData: NavigationExtras;
    if(location) {
      location.from = 'cart';
      navData = {
        queryParams: {
          data: JSON.stringify(location)
        }
      }
    }
    if(this.urlCheck == 'tabs') url = ['/', 'tabs', 'address', 'edit-address'];
    else url = [this.router.url, 'address', 'edit-address'];
    this.router.navigate(url, navData);
  }

  async changeAddress() {
    try {
      const options = {
        component: SearchLocationComponent,
        swipeToClose: true,
        // cssClass: 'custom-modal',
        cssClass: 'inline_modal',
        breakpoints: [0, 0.5, 0.8],
        initialBreakpoint: 0.8,
        componentProps: {
          from: 'cart'
        }
      };
      const address = await this.global.createModal(options);
      if(address) {
        if(address == 'add') this.addAddress();
        await this.addressService.changeAddress(address);
      }
    } catch(e) {
      console.log(e);
    }
  }

  async checkEmailVerified() {
    const verify = await this.global.showButtonToast('Please verify your email address to place order');
    console.log('verify: ', verify);
    if(verify) this.verifyOtp = true;
  }

  async makePayment() {
    try {
      const profile = await this.profileService.getProfile();
      if(profile && !profile?.email_verified) {
        this.checkEmailVerified();
        return;
      }
      console.log('model: ', this.model);
      const data = {
        restaurant_id: this.model.restaurant._id,
        instruction: this.instruction,
        // restaurant: this.model.restaurant,
        order: this.model.items, //JSON.stringify(this.model.items)
        // time: moment().format('lll'),
        address: this.location,
        total: this.model.totalPrice,
        grandTotal: this.model.grandTotal,
        deliveryCharge: this.deliveryCharge,
        status: 'Created',
        payment_status: true,
        payment_mode: 'COD'
      };
      console.log('order: ', data);
      await this.cartService.saveCartOrder(data);
      let url = [this.router.url, 'payment-option'];
      if(this.urlCheck == 'tabs') url = ['/', 'tabs', 'payment-option'];
      this.router.navigate(url);
    } catch(e) {
      console.log(e);
    }
  }

  resetOtpModal(value) {
    console.log(value);
    this.verifyOtp = false;
  }

  otpVerified(event) {
    if(event) this.modal.dismiss();
  }

  scrollToBottom() {
    this.content.scrollToBottom(500);
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave CartPage');
    if(this.model?.items && this.model?.items.length > 0) {
      this.cartService.saveCart();
    }
  }

  ngOnDestroy() {
    console.log('Destroy CartPage');
    if(this.addressSub) this.addressSub.unsubscribe();
    if(this.cartSub) this.cartSub.unsubscribe();
  }

}