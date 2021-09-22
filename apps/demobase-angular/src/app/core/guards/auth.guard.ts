import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly _demobaseService: DemobaseService,
    private readonly _walletStore: WalletStore,
    private readonly _connectionStore: ConnectionStore,
    private readonly _router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return combineLatest([
      this._walletStore.connected$,
      this._connectionStore.connection$,
    ]).pipe(
      map(([connected, connection]) => {
        if (
          !connected ||
          !connection ||
          this._demobaseService.programId === null
        ) {
          this._router.navigate(['/unauthorized']);

          return false;
        }

        return true;
      })
    );
  }
}
