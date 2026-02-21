import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-loading-restaurant',
  templateUrl: './loading-restaurant.component.html',
  styleUrls: ['./loading-restaurant.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class LoadingRestaurantComponent implements OnInit {
  
  dummy = Array(10);

  constructor() { }

  ngOnInit() {}

}
