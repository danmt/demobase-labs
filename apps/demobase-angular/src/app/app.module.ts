import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
  ConnectionStore,
  WalletStore,
  WALLET_CONFIG,
} from '@danmt/wallet-adapter-angular';
import { ReactiveComponentModule } from '@ngrx/component';
import {
  getPhantomWallet,
  getSolletWallet,
} from '@solana/wallet-adapter-wallets';

import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard';
import { demobaseServiceProvider } from './demobase-service.provider';
import { NavigationModule } from './navigation/navigation.module';
import { UnauthorizedComponent } from './unauthorized.component';

@NgModule({
  declarations: [AppComponent, UnauthorizedComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: 'applications',
        canActivate: [AuthGuard],
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
        path: 'unauthorized',
        component: UnauthorizedComponent,
      },
      {
        path: '**',
        redirectTo: 'applications',
      },
    ]),
    ReactiveFormsModule,
    ReactiveComponentModule,
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
    demobaseServiceProvider,
    AuthGuard,
    ConnectionStore,
    WalletStore,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
