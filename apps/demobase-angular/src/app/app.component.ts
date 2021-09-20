import { Component, OnInit } from '@angular/core';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { WalletName } from '@solana/wallet-adapter-wallets';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'demobase-root',
  template: `
    <header>
      <h1>Demobase - Angular</h1>

      <select
        *ngrxLet="wallets$; let wallets"
        [ngModel]="walletName$ | async"
        (ngModelChange)="onSelectWallet($event)"
      >
        <option [ngValue]="null">Select wallet</option>
        <option *ngFor="let wallet of wallets" [ngValue]="wallet.name">
          {{ wallet.name }}
        </option>
      </select>

      <ng-container *ngIf="address$ | ngrxPush as address">
        {{ address | obscureAddress }}
      </ng-container>

      <ng-container *ngrxLet="connected$; let connected">
        <button *ngIf="!connected" (click)="onConnect()">Connect</button>
        <button *ngIf="connected" (click)="onDisconnect()">Disconnect</button>
      </ng-container>
    </header>

    <main></main>
  `,
  styles: [],
  providers: [ConnectionStore, WalletStore],
})
export class AppComponent implements OnInit {
  connected$ = this._walletStore.connected$;
  walletName$ = this._walletStore.name$;
  address$ = this._walletStore.publicKey$.pipe(
    map((publicKey) => publicKey && publicKey.toBase58())
  );
  wallets$ = this._walletStore.wallets$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _connectionStore: ConnectionStore
  ) {}

  ngOnInit() {
    this._connectionStore.setEndpoint('http://localhost:8899');
  }

  onSelectWallet(walletName: WalletName) {
    this._walletStore.selectWallet(walletName);
  }

  onConnect() {
    this._walletStore.connect().subscribe();
  }

  onDisconnect() {
    if (confirm('Are you sure?')) {
      this._walletStore.disconnect().subscribe();
    }
  }
}
