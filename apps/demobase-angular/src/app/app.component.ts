import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { DemobaseService, getApplications } from '@demobase-labs/demobase-sdk';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { isNotNullOrUndefined } from './is-not-null-or-undefined.operator';

@Component({
  selector: 'demobase-root',
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

    <main>
      <section>
        <h2>Applications</h2>

        <form
          *ngIf="demobaseService$ | ngrxPush as demobaseService"
          [formGroup]="createApplicationGroup"
          (ngSubmit)="onCreateApplication(demobaseService)"
        >
          <label> Name: <input formControlName="name" type="text" /> </label>

          <button>Submit</button>
        </form>

        <ul *ngrxLet="applicationAccounts$; let applicationAccounts">
          <li *ngFor="let applicationAccount of applicationAccounts">
            {{ applicationAccount.info.name }}
          </li>
        </ul>
      </section>
    </main>
  `,
  styles: [],
  providers: [ConnectionStore, WalletStore],
})
export class AppComponent implements OnInit {
  selectWalletControl = new FormControl(null);
  createApplicationGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
  });
  connected$ = this._walletStore.connected$;
  address$ = this._walletStore.publicKey$.pipe(
    map((publicKey) => publicKey && publicKey.toBase58())
  );
  wallets$ = this._walletStore.wallets$;
  demobaseService$ = combineLatest([
    this._connectionStore.connection$.pipe(isNotNullOrUndefined),
    this._walletStore.anchorWallet$.pipe(isNotNullOrUndefined),
  ]).pipe(
    map(([connection, anchorWallet]) =>
      DemobaseService.create(connection, anchorWallet)
    )
  );
  applicationAccounts$ = this._connectionStore.connection$.pipe(
    isNotNullOrUndefined,
    switchMap((connection) => getApplications(connection))
  );

  get applicationNameControl() {
    return this.createApplicationGroup.get('name') as FormControl;
  }

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _connectionStore: ConnectionStore
  ) {}

  ngOnInit() {
    this._connectionStore.setEndpoint('http://localhost:8899');

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

  onCreateApplication(demobaseService: DemobaseService) {
    if (this.createApplicationGroup.valid) {
      demobaseService.createApplication(this.applicationNameControl.value);
    }
  }
}
