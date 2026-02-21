import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Strings } from './../../../enum/strings';
import { GlobalService } from 'src/app/services/global/global.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SignupPage implements OnInit {

  isLoading: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private global: GlobalService
  ) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    if(!form.valid) return;
    this.register(form);
  }

  register(form: NgForm) {
    this.isLoading = true;
    console.log(form.value);
    this.authService.register(form.value).then(data => {
      this.router.navigateByUrl(Strings.TABS + '/otp');
      this.isLoading = false;
      form.reset();
      this.global.successToast('An OTP is sent to your Email for Email Verification');
    })
    .catch(e => {
      console.log(e);
      this.isLoading = false;
      let msg = 'Could not sign you up, please try again';
      this.global.checkErrorMessageForAlert(e, msg);
      // if(e?.error?.message) {
      //   msg = e.error.message;
      // }
      // this.global.showAlert(msg);
    });
  }

}