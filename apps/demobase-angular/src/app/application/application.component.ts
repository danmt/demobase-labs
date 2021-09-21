import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConnectionStore } from '@danmt/wallet-adapter-angular';
import { getApplication } from '@demobase-labs/demobase-sdk';
import { PublicKey } from '@solana/web3.js';
import { combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { isNotNullOrUndefined } from '../is-not-null-or-undefined.operator';

@Component({
  selector: 'demobase-application',
  template: `
    <section>
      <h2>Application</h2>

      <ng-container
        *ngIf="applicationAccount$ | ngrxPush as applicationAccount"
      >
        {{ applicationAccount.info.name }}
      </ng-container>
    </section>
  `,
})
export class ApplicationComponent {
  applicationAccount$ = combineLatest([
    this._connectionStore.connection$.pipe(isNotNullOrUndefined),
    this._route.paramMap.pipe(map((paramMap) => paramMap.get('applicationId'))),
  ]).pipe(
    switchMap(([connection, applicationId]) => {
      console.log(connection, applicationId);

      if (!applicationId) {
        return of(null);
      }

      return getApplication(connection, new PublicKey(applicationId));
    })
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _connectionStore: ConnectionStore
  ) {}
}
