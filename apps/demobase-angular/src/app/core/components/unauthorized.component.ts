import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'demobase-unauthorized',
  template: `
    <section>
      <h2>You have to connect your wallet to continue.</h2>

      <select
        *ngrxLet="wallets$; let wallets"
        [formControl]="selectWalletControl"
      >
        <option [ngValue]="null">Select wallet</option>
        <option *ngFor="let wallet of wallets" [ngValue]="wallet.name">
          {{ wallet.name }}
        </option>
      </select>

      <button (click)="onConnect()">Connect</button>
    </section>
  `,
})
export class UnauthorizedComponent implements OnInit, OnDestroy {
  private readonly _destroy = new Subject();
  readonly selectWalletControl = new FormControl(null);
  readonly connected$ = this._walletStore.connected$;
  readonly wallets$ = this._walletStore.wallets$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _router: Router
  ) {}

  ngOnInit() {
    this._walletStore.name$
      .pipe(takeUntil(this._destroy))
      .subscribe((walletName) =>
        this.selectWalletControl.setValue(walletName, { emitEvent: false })
      );

    this.selectWalletControl.valueChanges
      .pipe(takeUntil(this._destroy))
      .subscribe((walletName) => this._walletStore.selectWallet(walletName));

    this._walletStore.connected$
      .pipe(
        filter((connected) => connected),
        takeUntil(this._destroy)
      )
      .subscribe(() => this._router.navigate(['/']));
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  onConnect() {
    this._walletStore.connect().subscribe();
  }
}
