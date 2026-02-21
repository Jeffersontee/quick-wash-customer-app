import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiService } from './../api/api.service';
import { Injectable } from '@angular/core';
import { Checkout } from 'capacitor-razorpay';

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {

  currency = 'INR';

  constructor(
    private api: ApiService
  ) { }

  async createRazorpayOrder(amount) {
    try {
      const param = {
        amount: amount * 100,
        currency: this.currency
      }
      const order = await lastValueFrom(this.api.post('order/create/razorpayOrder', param));
      return order;
    } catch(e) {
      throw(e);
    }
  }

  async payWithRazorpay(param) {
    const options = { 
      key: environment.razorpay.key_id,
      amount: (param.amount * 100).toString(),
      // amount: '100',
      // description: 'Great offers', 
      // image: 'https://i.imgur.com/3g7nmJC.png', 
      // image: '/assets/imgs/logo.png',
      // order_id: 'order_Cp10EhSaf7wLbS',//Order ID generated in Step 1
      currency: this.currency,
      name: 'Maza Eats', 
      prefill: { 
        email: param.email, 
        contact: param.phone
      },
      theme: {
        color: '#de0f17'
      }
    };
    try {
      const data = (await Checkout.open(options));
      console.log(data?.response);
      return data?.response;
    } catch(e) {
      throw(e);
    }
  }
}
