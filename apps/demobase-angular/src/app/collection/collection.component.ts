import { Component, HostBinding } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { PublicKey } from '@solana/web3.js';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'demobase-collection',
  template: `
    <ng-container *ngIf="collectionAccount$ | ngrxPush as collectionAccount">
      <header demobasePageHeader>
        <h1>{{ collectionAccount.info.name }}</h1>
        <p>Visualize all the details about this collection.</p>
      </header>

      <main>
        <h3>Attributes</h3>

        <form
          [formGroup]="createCollectionAttributeGroup"
          (ngSubmit)="onCreateCollectionAttribute()"
        >
          <label> Name: <input formControlName="name" type="text" /> </label>
          <label>
            Kind:
            <select formControlName="kind">
              <option [ngValue]="0">u8</option>
              <option [ngValue]="1">u16</option>
              <option [ngValue]="2">u32</option>
              <option [ngValue]="3">u64</option>
              <option [ngValue]="4">u128</option>
              <option [ngValue]="5">Pubkey</option>
            </select>
          </label>

          <label>
            Modifier:
            <select formControlName="modifier">
              <option [ngValue]="0">None</option>
              <option [ngValue]="1">Array</option>
              <option [ngValue]="2">Vector</option>
            </select>
          </label>

          <label *ngIf="collectionAttributeModifierControl.value === 1">
            Size: <input formControlName="size" type="number" />
          </label>

          <button>Submit</button>
        </form>

        <ul
          *ngrxLet="
            collectionAttributeAccounts$;
            let collectionAttributeAccounts
          "
        >
          <li
            *ngFor="
              let collectionAttributeAccount of collectionAttributeAccounts
            "
          >
            <p>Name: {{ collectionAttributeAccount.info.name }}.</p>
            <p>
              Kind: {{ collectionAttributeAccount.info.kind.name }} ({{
                collectionAttributeAccount.info.kind.size
              }}
              bytes).
            </p>
            <p>
              Modifier: {{ collectionAttributeAccount.info.modifier.name }} ({{
                collectionAttributeAccount.info.modifier.size
              }}).
            </p>
            <p>
              Total size:
              {{
                collectionAttributeAccount.info.kind.size *
                  collectionAttributeAccount.info.modifier.size
              }}
              bytes.
            </p>
          </li>
        </ul>

        <h3>Instructions</h3>

        <form
          [formGroup]="createCollectionInstructionGroup"
          (ngSubmit)="onCreateCollectionInstruction()"
        >
          <label> Name: <input formControlName="name" type="text" /> </label>
          <button>Submit</button>
        </form>

        <ul
          *ngrxLet="
            collectionInstructionAccounts$;
            let collectionInstructionAccounts
          "
        >
          <li
            *ngFor="
              let collectionInstructionAccount of collectionInstructionAccounts
            "
          >
            <p>Name: {{ collectionInstructionAccount.info.name }}</p>
            <a
              [routerLink]="[
                '/instructions',
                collectionAccount.info.application.toBase58(),
                collectionAccount.pubkey.toBase58(),
                collectionInstructionAccount.pubkey.toBase58()
              ]"
              >view</a
            >
          </li>
        </ul>
      </main>
    </ng-container>
  `,
})
export class CollectionComponent {
  @HostBinding('class') class = 'block p-4';
  readonly createCollectionAttributeGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    kind: new FormControl(0, { validators: [Validators.required] }),
    modifier: new FormControl(0, { validators: [Validators.required] }),
    size: new FormControl(1),
  });
  get collectionAttributeNameControl() {
    return this.createCollectionAttributeGroup.get('name') as FormControl;
  }
  get collectionAttributeKindControl() {
    return this.createCollectionAttributeGroup.get('kind') as FormControl;
  }
  get collectionAttributeModifierControl() {
    return this.createCollectionAttributeGroup.get('modifier') as FormControl;
  }
  get collectionAttributeSizeControl() {
    return this.createCollectionAttributeGroup.get('size') as FormControl;
  }

  readonly createCollectionInstructionGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
  });
  get collectionInstructionNameControl() {
    return this.createCollectionInstructionGroup.get('name') as FormControl;
  }

  readonly collectionAccount$ = this._route.paramMap.pipe(
    switchMap((paramMap) => {
      const collectionId = paramMap.get('collectionId');

      return collectionId
        ? this._demobaseService.getCollection(new PublicKey(collectionId))
        : of(null);
    })
  );
  readonly collectionAttributeAccounts$ = this._route.paramMap.pipe(
    switchMap((paramMap) => {
      const applicationId = paramMap.get('applicationId');
      const collectionId = paramMap.get('collectionId');

      return applicationId && collectionId
        ? this._demobaseService.getCollectionAttributes(
            new PublicKey(collectionId)
          )
        : of(null);
    })
  );
  readonly collectionInstructionAccounts$ = this._route.paramMap.pipe(
    switchMap((paramMap) => {
      const applicationId = paramMap.get('applicationId');
      const collectionId = paramMap.get('collectionId');

      return applicationId && collectionId
        ? this._demobaseService.getCollectionInstructions(
            new PublicKey(collectionId)
          )
        : of(null);
    })
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _demobaseService: DemobaseService
  ) {}

  onCreateCollectionAttribute() {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (
      this.createCollectionAttributeGroup.valid &&
      applicationId &&
      collectionId
    ) {
      const name = this.collectionAttributeNameControl.value;
      const kind = this.collectionAttributeKindControl.value;
      const modifier = this.collectionAttributeModifierControl.value;
      const size = this.collectionAttributeSizeControl.value;

      this._demobaseService.createCollectionAttribute(
        new PublicKey(applicationId),
        new PublicKey(collectionId),
        name,
        kind,
        modifier,
        size
      );
    }
  }

  onCreateCollectionInstruction() {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (
      this.createCollectionInstructionGroup.valid &&
      applicationId &&
      collectionId
    ) {
      const name = this.collectionInstructionNameControl.value;

      this._demobaseService.createCollectionInstruction(
        new PublicKey(applicationId),
        new PublicKey(collectionId),
        name
      );
    }
  }
}
