import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WALLET_CONFIG } from '@danmt/wallet-adapter-angular';
import { ReactiveComponentModule } from '@ngrx/component';
import {
  getPhantomWallet,
  getSolletWallet,
} from '@solana/wallet-adapter-wallets';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ObscureAddressPipe } from './obscure-address.pipe';

@NgModule({
  declarations: [AppComponent, ObscureAddressPipe],
  imports: [BrowserModule, FormsModule, ReactiveComponentModule],
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
