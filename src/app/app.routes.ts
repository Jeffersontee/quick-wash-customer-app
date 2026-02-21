import { Route, Routes } from '@angular/router';
import { Strings } from './enum/strings';
import { inject } from '@angular/core';
import { AuthService } from './services/auth/auth.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.routes').then((m) => m.routes),
    //canMatch: [async (route: Route) => await inject(AuthService).authGuard(route)],
    data: {
      role: Strings.USER_TYPE
    }
  },
  {
    path: 'login',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
      },
      {
        path: 'signup',
        loadComponent: () => import('./pages/login/signup/signup.page').then( m => m.SignupPage)
      },
    ],
    canMatch: [async () => await inject(AuthService).autoLoginGuard()],
  },
  {
    path: 'admin',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/admin.page').then( m => m.AdminPage)
      },
      {
        path: 'add-banner',
        loadComponent: () => import('./pages/admin/add-banner/add-banner.page').then( m => m.AddBannerPage)
      },
      {
        path: 'add-restaurant',
        loadComponent: () => import('./pages/admin/add-restaurant/add-restaurant.page').then( m => m.AddRestaurantPage)
      },
      {
        path: 'add-menu-item',
        loadComponent: () => import('./pages/admin/add-menu-item/add-menu-item.page').then( m => m.AddMenuItemPage)
      },
    ],
    canMatch: [async (route: Route) => await inject(AuthService).authGuard(route)],
    data: {
      role: Strings.ADMIN_TYPE
    }
  },
];
