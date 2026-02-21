import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { TokenInterceptor } from './app/services/token-interceptor/token-interceptor.service';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    // { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(
      // withInterceptorsFromDi()
      withInterceptors([TokenInterceptor])
    ),
    importProvidersFrom(
      IonicModule.forRoot({}), 
      // HttpClientModule
    ),
    provideRouter(routes),
  ],
});

  // Call the element loader after the platform has been bootstrapped
  defineCustomElements(window);
