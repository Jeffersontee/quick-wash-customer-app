import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StripeService } from './../../../services/stripe/stripe.service';
import { User } from './../../../models/user.model';
import { Subscription } from 'rxjs';
import { RazorpayService } from './../../../services/razorpay/razorpay.service';
import { ProfileService } from './../../../services/profile/profile.service';
import { OrderService } from 'src/app/services/order/order.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Order } from 'src/app/models/order.model';
import { CartService } from 'src/app/services/cart/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-option',
  templateUrl: './payment-option.page.html',
  styleUrls: ['./payment-option.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PaymentOptionPage implements OnInit {

  urlCheck: any;
  url: any;
  order = {} as Order;
  profile = {} as User;
  profileSub: Subscription;

  constructor(
    private router: Router,
    private cartService: CartService,
    private global: GlobalService,
    private orderService: OrderService,
    private profileService: ProfileService,
    private razorpay: RazorpayService,
    private stripe: StripeService
  ) { }

  async ngOnInit() {
    await this.getData();
    this.profileSub = this.profileService.profile.subscribe(profile => {
      console.log('profile: ', profile);
      this.profile = profile;
    })
  }

  async getData() {
    try {
      await this.checkUrl();
      await this.profileService.getProfile();
      const order = await this.cartService.getCartOrder();
      this.order = JSON.parse(order?.value);
      console.log('payment order', this.order);
    } catch(e) {
      console.log(e);
      this.global.errorToast();
    }
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

  async placeOrder(order) {
    try {
      this.global.showLoader();
      await this.orderService.placeOrder(order);
      // clear cart
      await this.cartService.clearCart();
      this.global.hideLoader();
      this.global.successToast('Your Order is Placed Successfully');
      this.router.navigateByUrl('/tabs/account');

    } catch(e) {
      console.log(e);
      this.global.hideLoader();
      this.global.checkMessageForErrorToast(e);
      // let msg;
      // if(e?.error?.message) {
      //   msg = e.error.message;
      // }
      // this.global.errorToast(msg);
    }
  }

  placeCodOrder() {
    this.placeOrder(this.order);
  }

  async payWithRazorpay() {
    try {
      // create razorpay order to get the order id
      const razorpay_order = await this.razorpay.createRazorpayOrder(this.order.grandTotal);
      console.log('razorpay order: ', razorpay_order);
      const param = { 
        email: this.profile.email, 
        phone: this.profile.phone,
        amount: this.order.grandTotal,
        order_id: razorpay_order.id, // required in live mode
      };
      const data: any = await this.razorpay.payWithRazorpay(param);
      console.log('razorpay data: ', data);
      // place order
      const order = {
        ...this.order,
        payment_mode: 'Razorpay',
        payment_id: data.razorpay_payment_id
      };
      await this.placeOrder(order);
    } catch(e) {
      console.log(e);
      this.global.checkMessageForErrorToast(e);
    }
  }

  async payWithStripe() {
    try {
      // create stripe order to get the order id
      this.global.showLoader();
      console.log('profile: ', this.profile);
      const stripe_data = {
        name: this.profile?.name,
        email: this.profile?.email,
        // amount: 1,
        amount: this.order?.grandTotal,
        currency: 'inr'
      };
      const paymentIntent = await this.stripe.paymentFlow(stripe_data);
      console.log('paymentIntent: ', paymentIntent);

      const payment_desc = paymentIntent.split('_').slice(0, 2).join('_');
      console.log('paymentIntent: ', payment_desc);
      this.global.hideLoader();

      // place order
      const order = {
        ...this.order,
        payment_mode: 'Stripe',
        payment_id: payment_desc
      };
      await this.placeOrder(order);
    } catch(e) {
      console.log(e);
      this.global.hideLoader();
      this.global.checkMessageForErrorToast(e);
    }
  }

}