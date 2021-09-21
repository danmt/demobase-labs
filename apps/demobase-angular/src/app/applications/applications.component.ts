import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { DemobaseService, getApplications } from '@demobase-labs/demobase-sdk';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { isNotNullOrUndefined } from '../is-not-null-or-undefined.operator';

@Component({
  selector: 'demobase-applications',
  template: `
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

          <a
            [routerLink]="[
              '/applications',
              applicationAccount.pubkey.toBase58()
            ]"
            >view</a
          >
        </li>
      </ul>
    </section>
  `,
})
export class ApplicationsComponent {
  createApplicationGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
  });
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

  onCreateApplication(demobaseService: DemobaseService) {
    if (this.createApplicationGroup.valid) {
      demobaseService.createApplication(this.applicationNameControl.value);
    }
  }
}
