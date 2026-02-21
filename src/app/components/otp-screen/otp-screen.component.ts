import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global/global.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { OtpInputComponent } from '../otp-input/otp-input.component';

@Component({
  selector: 'app-otp-screen',
  templateUrl: './otp-screen.component.html',
  styleUrls: ['./otp-screen.component.scss'],
  standalone: true,
  imports: [IonicModule, OtpInputComponent]
})
export class OtpScreenComponent implements OnInit {

  @Input() sendOtp = false;
  otp: string;
  length: number;
  @Output() verified: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private global: GlobalService,
    private profile: ProfileService
  ) { }

  ngOnInit() {
    if(this.sendOtp) this.resend();
  }

  getOtpLength(length) {
    this.length = length;
  }

  onOtpChange(otp) {
    this.otp = otp;
    console.log(this.otp);
  }

  resend() {
    console.log('send otp again');
    this.global.showLoader();
    this.profile.resendOtp()
    .then(response => {
      console.log(response);
      this.global.hideLoader();
      if(response?.success) this.global.successToast('An OTP is sent to your Email for Email Verification');
    })
    .catch(e => {
      console.log(e);
      this.global.hideLoader();
      let msg = 'Something went wrong! Please try again.';
      this.global.checkErrorMessageForAlert(e, msg);
      // if(e?.error?.message) {
      //   msg = e.error.message;
      // }
      // this.global.showAlert(msg);
    });
  }

  verify() {
    if(this.otp?.length != this.length) return this.global.showAlert('Please enter proper OTP');
    this.global.showLoader();
    this.profile.verifyEmailOtp({ verification_token: this.otp })
    .then(response => {
      console.log(response);
      this.global.hideLoader();
      this.global.successToast('Your Email is Verified Successfully');
      this.verified.emit(true);
    })
    .catch(e => {
      console.log(e);
      this.global.hideLoader();
      let msg = 'Something went wrong! Please try again.';
      this.global.checkErrorMessageForAlert(e, msg);
      // if(e?.error?.message) {
      //   msg = e.error.message;
      // }
      // this.global.showAlert(msg);
    });
  }

}