import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { EditProfileComponent } from 'src/app/components/edit-profile/edit-profile.component';
import { Order } from 'src/app/models/order.model';
import { CartService } from 'src/app/services/cart/cart.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { OrderService } from 'src/app/services/order/order.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth/auth.service';
import { OrdersComponent } from 'src/app/components/orders/orders.component';
import { OtpScreenComponent } from 'src/app/components/otp-screen/otp-screen.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule, OrdersComponent, OtpScreenComponent]
})
export class AccountPage implements OnInit, OnDestroy {

  @ViewChild('filePicker', {static: false}) filePickerRef: ElementRef;
  @ViewChild('otp_modal') modal: ModalController;
  serverUrl = environment.serverUrl;
  profile: any = {};
  isLoading: boolean;
  orders: Order[] = [];
  ordersSub: Subscription;
  profileSub: Subscription;
  verifyOtp = false;
  page = 1;
  data: any;

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    public global: GlobalService,
    private profileService: ProfileService,
    private auth: AuthService
    ) { }

  ngOnInit() {
    this.ordersSub = this.orderService.orders.subscribe({
      next: order => {
        console.log('order data: ', order);
        this.orders = order;
      }, 
      error: e => {
        console.log(e);
      }
    });
    this.profileSub = this.profileService.profile.subscribe(profile => {
      this.profile = profile;
      console.log(this.profile);
    });
    this.getData();
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter AccountPage');
    this.global.customStatusbar(true);
  }

  async getData() {
    try {
      this.isLoading = true;
      await this.profileService.getProfile();
      this.data = await this.orderService.getOrders(this.page);
      console.log('user orders: ', this.data);
      this.isLoading = false;
    } catch(e) {
      console.log(e);
      this.isLoading = false;
      this.global.checkMessageForErrorToast(e);
      // let msg;
      // if(e?.error?.message) {
      //   msg = e.error.message;
      // }
      // this.global.errorToast(msg);
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
          this.data = await this.orderService.getOrders(this.page);
          console.log(this.data);
        }
        console.log(this.orders);
        event.target.complete();
        // if(this.data?.nextPage) event.target.disabled = true;
        if(this.data?.orders?.length < perPage) {
          this.global.infoToast('Wow! All Orders Fetched Successfully. No more orders left...');
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

  confirmLogout() {
    this.global.showAlert(
      'Are you sure you want to sign-out?',
      'Confirm',
      [
        {
          text: 'No',
          role: 'cancel'
        }, {
          text: 'Yes',
          handler: () => {
            this.logout();
          }
        }
      ]
    );
  }

  async logout() {
    try {
      this.global.showLoader();
      await this.auth.logout();
      this.global.hideLoader();
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

  async reorder(order: Order) {
    console.log(order);
    let data = await this.cartService.getCart();
    console.log('data: ', data);
    if(data?.value) {
      this.cartService.alertClearCart(null, null, null, order);
    } else {
      this.cartService.orderToCart(order);
    }
  }

  getHelp(order) {
    console.log(order);
  }

  async editProfile() {
    const options = {
      component: EditProfileComponent,
      componentProps: {
        profile: this.profile
      },
      // cssClass: 'custom-modal',
      cssClass: 'inline_modal',
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.8,
      swipeToClose: true,
    };
    const modal = await this.global.createModal(options);
    if(modal) {
      this.verifyOtp = true;
    }
  }

  resetOtpModal(value) {
    console.log(value);
    this.verifyOtp = false;
  }

  otpVerified(event) {
    if(event) this.modal.dismiss();
  }

  async editPicture() {
    try {
      if(this.global.checkPlatformForWeb()) this.filePickerRef.nativeElement.click();
      else {
        const imageData = await this.global.takePicture();
        if(imageData) {
          const blob = this.global.getBlob(imageData.base64String);
          const imageFile = new File([blob], 'profile.png', { type: 'image/png' });
          this.uploadProfilePic(imageFile);
        }
      }
    } catch(e) {
      console.log(e);
    }
  }

  async onFileChosen(event) {
    try {
      const imageFile = this.global.chooseImageFile(event);
      console.log('imagedata: ', imageFile);
      if(imageFile) {
        this.uploadProfilePic(imageFile);
      }
    } catch(e) {
      console.log(e);
    }
  }

  async uploadProfilePic(imageFile) {
    try {
      this.global.showLoader();
      let postData = new FormData();
      postData.append('profileImages', imageFile, imageFile.name || 'profile.jpg');
      const response = await this.profileService.updateProfilePic(postData);
      console.log(response);
      this.global.successToast('Profile picture updated');
      this.global.hideLoader();
    } catch(e) {
      console.log(e);
      this.global.hideLoader();
      this.global.checkMessageForErrorToast(e);
    }
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave AccountPage');
    this.global.customStatusbar();
  }

  ngOnDestroy() {
    if(this.ordersSub) this.ordersSub.unsubscribe();
    if(this.profileSub) this.profileSub.unsubscribe();
  }

}
