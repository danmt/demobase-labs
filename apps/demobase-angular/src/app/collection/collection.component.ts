import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { PublicKey } from '@solana/web3.js';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'demobase-collection',
  template: `
    <section *ngIf="collectionAccount$ | ngrxPush as collectionAccount">
      <h2>{{ collectionAccount.info.name }}</h2>
      <p>Visualize all the details about this application.</p>

      <form
        [formGroup]="createCollectionAttributeGroup"
        (ngSubmit)="onCreateCollectionAttribute(collectionAccount.pubkey)"
      >
        <label> Name: <input formControlName="name" type="text" /> </label>
        <label>
          Type:
          <select formControlName="type">
            <option [ngValue]="{ name: 'u8', size: 1 }">u8 | Size: 1</option>
            <option [ngValue]="{ name: 'u16', size: 2 }">u16 | Size: 2</option>
            <option [ngValue]="{ name: 'u32', size: 4 }">u32 | Size: 4</option>
            <option [ngValue]="{ name: 'u64', size: 8 }">u64 | Size: 8</option>
            <option [ngValue]="{ name: 'Pubkey', size: 32 }">
              Pubkey | Size: 32
            </option>
          </select>
        </label>

        <label>
          Is Array? <input formControlName="isArray" type="checkbox" />
        </label>
        <label *ngIf="collectionAttributeIsArrayControl.value">
          Length: <input formControlName="length" type="number" />
        </label>

        <button>Submit</button>
      </form>

      <ul
        *ngrxLet="collectionAttributeAccounts$; let collectionAttributeAccounts"
      >
        <li
          *ngFor="let collectionAttributeAccount of collectionAttributeAccounts"
        >
          <p>Name: {{ collectionAttributeAccount.info.name }}</p>
          <p>Type: {{ collectionAttributeAccount.info.attributeType }}</p>
          <p>Size: {{ collectionAttributeAccount.info.size }}</p>
        </li>
      </ul>
    </section>
  `,
})
export class CollectionComponent {
  readonly createCollectionAttributeGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    type: new FormControl(null, { validators: [Validators.required] }),
    isArray: new FormControl(0),
    length: new FormControl(1),
  });

  get collectionAttributeNameControl() {
    return this.createCollectionAttributeGroup.get('name') as FormControl;
  }
  get collectionAttributeTypeControl() {
    return this.createCollectionAttributeGroup.get('type') as FormControl;
  }
  get collectionAttributeIsArrayControl() {
    return this.createCollectionAttributeGroup.get('isArray') as FormControl;
  }
  get collectionAttributeLengthControl() {
    return this.createCollectionAttributeGroup.get('length') as FormControl;
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
      const collectionId = paramMap.get('collectionId');

      return collectionId
        ? this._demobaseService.getCollectionAttributes(
            new PublicKey(collectionId)
          )
        : of(null);
    })
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _demobaseService: DemobaseService
  ) {}

  onCreateCollectionAttribute(collectionId: PublicKey) {
    if (this.createCollectionAttributeGroup.valid) {
      const name = this.collectionAttributeNameControl.value;
      const size =
        this.collectionAttributeTypeControl.value.size *
        this.collectionAttributeLengthControl.value;
      const type = this.collectionAttributeIsArrayControl.value
        ? `[${this.collectionAttributeTypeControl.value.name}; ${this.collectionAttributeLengthControl.value}]`
        : this.collectionAttributeTypeControl.value.name;

      this._demobaseService.createCollectionAttribute(
        collectionId,
        name,
        type,
        size
      );
    }
  }
}
