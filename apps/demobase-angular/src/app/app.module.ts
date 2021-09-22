import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { WALLET_CONFIG } from '@danmt/wallet-adapter-angular';
import {
  getPhantomWallet,
  getSolletWallet,
} from '@solana/wallet-adapter-wallets';

import { AppComponent } from './app.component';
import { NavigationModule } from './navigation/navigation.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: 'applications',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./applications/applications.module').then(
                (m) => m.ApplicationsModule
              ),
          },
          {
            path: ':applicationId',
            loadChildren: () =>
              import('./application/application.module').then(
                (m) => m.ApplicationModule
              ),
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'applications',
      },
    ]),
    NavigationModule,
  ],
  providers: [
    {
      provide: WALLET_CONFIG,
      useValue: {
        wallets: [getPhantomWallet(), getSolletWallet()],
        autoConnect: true,
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
