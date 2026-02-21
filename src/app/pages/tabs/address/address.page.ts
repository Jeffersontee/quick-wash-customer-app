import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { AddressService } from 'src/app/services/address/address.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { EmptyScreenComponent } from 'src/app/components/empty-screen/empty-screen.component';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, EmptyScreenComponent]
})
export class AddressPage implements OnInit, OnDestroy {

  isLoading: boolean;
  addresses: Address[] = [];
  addressesSub: Subscription;
  model = {
    title: 'No Addresses added yet',
    icon: 'location-outline'
  };
  data: any;
  page = 1;

  constructor(
    private global: GlobalService,
    private addressService: AddressService,
    private router: Router) { }

  ngOnInit() {
    this.addressesSub = this.addressService.addresses.subscribe(address => {
      console.log('addresses: ', address);
      this.addresses = address;      
    });
    this.getAddresses();
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter AddressPage');
    this.global.customStatusbar();
  }

  async getAddresses() {    
    try {
      this.isLoading = true;
      this.global.showLoader();
      this.data = await this.addressService.getAddresses();
      console.log(this.data);
      console.log(this.addresses);
      this.isLoading = false;
      this.global.hideLoader();
    } catch(e) {
      this.isLoading = false;
      this.global.hideLoader();
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
          this.data = await this.addressService.getAddresses(null, this.page);
          console.log(this.data);
        }
        console.log(this.addresses);
        event.target.complete();
        // if(this.data?.nextPage) event.target.disabled = true;
        if(this.data?.addresses?.length < perPage) {
          this.global.infoToast('Wow! All Addresses Fetched Successfully. No more addresses left...');
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

  getIcon(title) {
    return this.global.getIcon(title);
  }

  editAddress(address) {
    console.log(address);
    const navData: NavigationExtras = {
      queryParams: {
        data: JSON.stringify(address)
      }
    };
    this.router.navigate([this.router.url, 'edit-address'], navData);
  }

  deleteAddressAlert(address) {
    console.log('address: ', address);
    this.global.showAlert(
      'Are you sure you want to delete this address?',
      'Confirm',
      [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('cancel');
            return;
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.deleteAddress(address);
          }
        }
      ]
    )
  }

  async deleteAddress(address) {
    try {
      this.global.showLoader();
      await this.addressService.deleteAddress(address);
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

  ngOnDestroy() {
    if(this.addressesSub) this.addressesSub.unsubscribe();
    this.global.customStatusbar(true);
  }

}