import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { PublicKey } from '@solana/web3.js';
import { defer, from } from 'rxjs';

@Component({
  selector: 'demobase-collections',
  template: `
    <section>
      <h2>Collections</h2>

      <form
        [formGroup]="createCollectionGroup"
        (ngSubmit)="onCreateCollection()"
      >
        <label> Name: <input formControlName="name" type="text" /> </label>

        <select
          *ngrxLet="applicationAccounts$; let applicationAccounts"
          formControlName="applicationId"
        >
          <option
            *ngFor="let applicationAccount of applicationAccounts"
            [ngValue]="applicationAccount.pubkey"
          >
            {{ applicationAccount.info.name }} |
            {{ applicationAccount.pubkey.toBase58() | obscureAddress }}
          </option>
        </select>

        <button>Submit</button>
      </form>

      <ul *ngrxLet="collectionAccounts$; let collectionAccounts">
        <li *ngFor="let collectionAccount of collectionAccounts">
          {{ collectionAccount.info.name }}

          <a
            [routerLink]="[
              '/collections',
              collectionAccount.info.application.toBase58(),
              collectionAccount.pubkey.toBase58()
            ]"
            >view</a
          >
        </li>
      </ul>
    </section>
  `,
})
export class CollectionsComponent {
  readonly createCollectionGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    applicationId: new FormControl('', { validators: [Validators.required] }),
  });
  readonly applicationAccounts$ = from(
    defer(() => this._demobaseService.getApplications())
  );
  readonly collectionAccounts$ = from(
    defer(() => this._demobaseService.getCollections())
  );

  get collectionNameControl() {
    return this.createCollectionGroup.get('name') as FormControl;
  }
  get collectionApplicationIdControl() {
    return this.createCollectionGroup.get('applicationId') as FormControl;
  }

  constructor(private readonly _demobaseService: DemobaseService) {}

  onCreateCollection() {
    if (this.createCollectionGroup.valid) {
      this._demobaseService.createCollection(
        new PublicKey(this.collectionApplicationIdControl.value),
        this.collectionNameControl.value
      );
    }
  }
}
