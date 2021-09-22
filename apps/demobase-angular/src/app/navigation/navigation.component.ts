import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { map } from 'rxjs/operators';

@Component({
  selector: 'demobase-navigation',
  template: `
    <header>
      <h1>Demobase - Angular</h1>

      <select
        *ngrxLet="wallets$; let wallets"
        [formControl]="selectWalletControl"
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
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent implements OnInit {
  selectWalletControl = new FormControl(null);
  connected$ = this._walletStore.connected$;
  address$ = this._walletStore.publicKey$.pipe(
    map((publicKey) => publicKey && publicKey.toBase58())
  );
  wallets$ = this._walletStore.wallets$;

  constructor(private readonly _walletStore: WalletStore) {}

  ngOnInit() {
    this._walletStore.name$.subscribe((walletName) =>
      this.selectWalletControl.setValue(walletName, { emitEvent: false })
    );

    this.selectWalletControl.valueChanges.subscribe((walletName) =>
      this._walletStore.selectWallet(walletName)
    );
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
