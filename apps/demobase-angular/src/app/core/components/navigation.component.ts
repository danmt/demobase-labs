import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'demobase-navigation',
  template: `
    <header>
      <h1>Demobase - Angular</h1>

      <ng-container *ngIf="address$ | ngrxPush as address">
        {{ address | obscureAddress }}
      </ng-container>

      <button *ngIf="connected$ | ngrxPush" (click)="onDisconnect()">
        Disconnect
      </button>

      <nav>
        <a [routerLink]="['/applications']">Applications</a>
        <a [routerLink]="['/collections']">Collections</a>
      </nav>
    </header>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent implements OnInit, OnDestroy {
  private readonly _destroy = new Subject();
  readonly selectWalletControl = new FormControl(null);
  readonly connected$ = this._walletStore.connected$;
  readonly address$ = this._walletStore.publicKey$.pipe(
    map((publicKey) => publicKey && publicKey.toBase58())
  );
  readonly wallets$ = this._walletStore.wallets$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _router: Router
  ) {}

  ngOnInit() {
    this.connected$
      .pipe(
        filter((connected) => !connected),
        takeUntil(this._destroy)
      )
      .subscribe(() => this._router.navigate(['/unauthorized']));
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  onDisconnect() {
    if (confirm('Are you sure?')) {
      this._walletStore.disconnect().subscribe();
    }
  }
}
