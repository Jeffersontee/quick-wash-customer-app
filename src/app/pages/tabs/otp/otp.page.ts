import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { OtpScreenComponent } from 'src/app/components/otp-screen/otp-screen.component';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, OtpScreenComponent]
})
export class OtpPage implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  verify(event) {
    if(event) this.router.navigateByUrl('/tabs/home', {replaceUrl: true});
  }

}