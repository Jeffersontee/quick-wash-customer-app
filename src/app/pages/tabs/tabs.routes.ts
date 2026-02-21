import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'account',
        loadComponent: () => import('./account/account.page').then( m => m.AccountPage)
      },
      {
        path: 'cart',
        children: [
          {
            path: '',
            loadComponent: () => import('./cart/cart.page').then( m => m.CartPage)
          },
          {
            path: 'address',
            children: [
              {
                path: '',
                loadComponent: () => import('./address/address.page').then( m => m.AddressPage)
              },
              {
                path: 'edit-address',
                loadComponent: () => import('./address/edit-address/edit-address.page').then( m => m.EditAddressPage)
              },
            ]
          },
          {
            path: 'payment-option',
            loadComponent: () => import('./payment-option/payment-option.page').then( m => m.PaymentOptionPage)
          },
        ]
      },
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then( m => m.HomePage)
      },
      {
        path: 'search',
        loadComponent: () => import('./search/search.page').then( m => m.SearchPage)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
  {
    path: 'address',
    children: [
      {
        path: '',
        loadComponent: () => import('./address/address.page').then( m => m.AddressPage)
      },
      {
        path: 'edit-address',
        loadComponent: () => import('./address/edit-address/edit-address.page').then( m => m.EditAddressPage)
      },
    ]
  },
  {
    path: 'restaurants/:restaurantId',
    children: [
      {
        path: '',
        loadComponent: () => import('./items/items.page').then( m => m.ItemsPage)
      },
      {
        path: 'cart',
        children: [
          {
            path: '',
            loadComponent: () => import('./cart/cart.page').then( m => m.CartPage)
          },
          {
            path: 'address',
            children: [
              {
                path: '',
                loadComponent: () => import('./address/address.page').then( m => m.AddressPage)
              },
              {
                path: 'edit-address',
                loadComponent: () => import('./address/edit-address/edit-address.page').then( m => m.EditAddressPage)
              },
            ]
          },
          {
            path: 'payment-option',
            loadComponent: () => import('./payment-option/payment-option.page').then( m => m.PaymentOptionPage)
          },
        ]
      },
    ]
  },
  {
    path: 'otp',
    loadComponent: () => import('./otp/otp.page').then( m => m.OtpPage)
  },
  {
    path: 'payment-option',
    loadComponent: () => import('./payment-option/payment-option.page').then( m => m.PaymentOptionPage)
  },
];
