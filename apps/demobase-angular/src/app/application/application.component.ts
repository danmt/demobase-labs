import { Component, HostBinding } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { PublicKey } from '@solana/web3.js';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'demobase-application',
  template: `
    <ng-container *ngIf="applicationAccount$ | ngrxPush as applicationAccount">
      <header demobasePageHeader>
        <h1>{{ applicationAccount.info.name }}</h1>
        <p>Visualize all the details about this application.</p>
      </header>

      <main>
        <form
          [formGroup]="createCollectionGroup"
          (ngSubmit)="onCreateCollection(applicationAccount.pubkey)"
        >
          <label> Name: <input formControlName="name" type="text" /> </label>

          <button>Submit</button>
        </form>

        <ul *ngrxLet="collectionAccounts$; let collectionAccounts">
          <li *ngFor="let collectionAccount of collectionAccounts">
            {{ collectionAccount.info.name }}

            <a
              [routerLink]="[
                '/collections',
                applicationAccount.pubkey.toBase58(),
                collectionAccount.pubkey.toBase58()
              ]"
              >view</a
            >
          </li>
        </ul>
      </main>
    </ng-container>
  `,
})
export class ApplicationComponent {
  @HostBinding('class') class = 'block p-4';
  readonly createCollectionGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
  });

  readonly applicationAccount$ = this._route.paramMap.pipe(
    switchMap((paramMap) => {
      const applicationId = paramMap.get('applicationId');

      return applicationId
        ? this._demobaseService.getApplication(new PublicKey(applicationId))
        : of(null);
    })
  );

  readonly collectionAccounts$ = this._route.paramMap.pipe(
    switchMap((paramMap) => {
      const applicationId = paramMap.get('applicationId');

      return applicationId
        ? this._demobaseService.getCollectionsByApplication(
            new PublicKey(applicationId)
          )
        : of(null);
    })
  );

  get collectionNameControl() {
    return this.createCollectionGroup.get('name') as FormControl;
  }

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _demobaseService: DemobaseService
  ) {}

  onCreateCollection(applicationId: PublicKey) {
    if (this.createCollectionGroup.valid) {
      this._demobaseService.createCollection(
        applicationId,
        this.collectionNameControl.value
      );
    }
  }
}
