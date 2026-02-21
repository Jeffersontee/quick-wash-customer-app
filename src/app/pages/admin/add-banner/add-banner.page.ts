import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BannerService } from 'src/app/services/banner/banner.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-add-banner',
  templateUrl: './add-banner.page.html',
  styleUrls: ['./add-banner.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddBannerPage implements OnInit {

  bannerImage: any;
  banner_file: any;
  files: any;

  constructor(
    private banner: BannerService,
    private global: GlobalService
  ) { }

  ngOnInit() {
  }

  preview(event) {
    this.global.showLoader();
    console.log(event);
    const files = event.target.files;
    if(files.length == 0) return;
    const mimeType = files[0].type;
    if(mimeType.match(/image\/*/) == null) return;
    this.files = files;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('result: ', reader.result);
      this.bannerImage = reader.result;
    }
    reader.readAsDataURL(file);
    this.banner_file = file;
    this.global.hideLoader();
  }

  async save() {
    try {
      this.global.showLoader();
      console.log(this.banner_file);
      let postData = new FormData;
      postData.append('bannerImages', this.banner_file, this.banner_file.name);
      const response = await this.banner.addBanner(postData);
      console.log(response);
      this.global.successToast('Banner added successfully');
      this.global.hideLoader();
    } catch(e) {
      this.global.hideLoader();
      console.log(e);
    }
  }

}
