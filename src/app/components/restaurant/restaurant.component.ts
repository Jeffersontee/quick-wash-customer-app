import { environment } from 'src/environments/environment';
import { Component, OnInit, Input } from '@angular/core';
import { Restaurant } from 'src/app/models/restaurant.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class RestaurantComponent implements OnInit {

  @Input() restaurant: Restaurant;
  serverImageUrl = environment.serverUrl;

  constructor() { }

  ngOnInit() {}

  getCuisine(cuisine) {
    return cuisine.join(', ');
  }

}
