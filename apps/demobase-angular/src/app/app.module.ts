import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  ConnectionStore,
  WALLET_CONFIG,
  WalletStore,
} from '@danmt/wallet-adapter-angular';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { ReactiveComponentModule } from '@ngrx/component';
import {
  getPhantomWallet,
  getSolletWallet,
} from '@solana/wallet-adapter-wallets';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { DemobaseStore } from './core/stores/demobase.store';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      [
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
      ],
      {
        initialNavigation: 'enabledBlocking',
        paramsInheritanceStrategy: 'always',
        onSameUrlNavigation: 'reload',
      }
    ),
    ReactiveFormsModule,
    ReactiveComponentModule,
    CoreModule,
  ],
  providers: [
    {
      provide: WALLET_CONFIG,
      useValue: {
        wallets: [getPhantomWallet(), getSolletWallet()],
        autoConnect: true,
      },
    },
    {
      provide: DemobaseService,
      useClass: DemobaseService,
    },
    ConnectionStore,
    WalletStore,
    DemobaseStore,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
