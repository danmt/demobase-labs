import { Component, OnInit } from '@angular/core';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { combineLatest } from 'rxjs';
import { isNotNullOrUndefined } from './shared/operators/is-not-null-or-undefined.operator';

@Component({
  selector: 'demobase-root',
  template: `
    <demobase-navigation>
      <router-outlet></router-outlet>
    </demobase-navigation>
  `,
  styles: [],
  providers: [],
})
export class AppComponent implements OnInit {
  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _demobaseService: DemobaseService
  ) {}

  ngOnInit() {
    this._connectionStore.setEndpoint('http://localhost:8899');

    combineLatest([
      this._connectionStore.connection$.pipe(isNotNullOrUndefined),
      this._walletStore.anchorWallet$.pipe(isNotNullOrUndefined),
    ]).subscribe(([connection, wallet]) =>
      this._demobaseService.setProgramFromConfig(connection, wallet)
    );
  }
}
