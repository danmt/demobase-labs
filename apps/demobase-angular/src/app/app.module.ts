import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { WALLET_CONFIG } from '@danmt/wallet-adapter-angular';
import {
  getPhantomWallet,
  getSolletWallet,
} from '@solana/wallet-adapter-wallets';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          loadChildren: () =>
            import('@demobase-labs/application/shell').then(
              (m) => m.ShellModule
            ),
        },
      ],
      {
        initialNavigation: 'enabledBlocking',
        paramsInheritanceStrategy: 'always',
        onSameUrlNavigation: 'reload',
      }
    ),
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: WALLET_CONFIG,
      useValue: {
        wallets: [getPhantomWallet(), getSolletWallet()],
        autoConnect: true,
      },
    },
  ],
})
export class AppModule {}
