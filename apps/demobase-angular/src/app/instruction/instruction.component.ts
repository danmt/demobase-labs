import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AccountBoolAttributeInfo,
  AccountBoolAttributeKind,
  DemobaseService,
  InstructionAccountInfo,
} from '@demobase-labs/demobase-sdk';
import { PublicKey } from '@solana/web3.js';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'demobase-instruction',
  template: `
    <section *ngIf="instruction$ | ngrxPush as instruction">
      <h2>{{ instruction.data.name }}</h2>
      <p>Visualize all the details about this application.</p>

      <h3>Arguments</h3>

      <form
        [formGroup]="createInstructionArgumentGroup"
        (ngSubmit)="onCreateInstructionArgument(instruction.id)"
      >
        <label> Name: <input formControlName="name" type="text" /> </label>
        <label>
          Type:
          <select formControlName="kind">
            <option [ngValue]="0">u8</option>
            <option [ngValue]="1">u16</option>
            <option [ngValue]="2">u32</option>
            <option [ngValue]="3">u64</option>
            <option [ngValue]="4">u128</option>
            <option [ngValue]="5">Pubkey</option>
            <option [ngValue]="6">String</option>
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

        <label *ngIf="instructionArgumentModifierControl.value === 1">
          Size: <input formControlName="size" type="number" />
        </label>

        <button>Submit</button>
      </form>

      <ul>
        <li *ngFor="let argument of instruction.arguments">
          <h4>Name: {{ argument.data.name }}.</h4>
          <p>Kind: {{ argument.data.kind }}.</p>
          <p>
            Modifier: {{ argument.data.modifier.name }} ({{
              argument.data.modifier.size
            }}).
          </p>
        </li>
      </ul>

      <h3>Accounts</h3>

      <form
        [formGroup]="createInstructionAccountGroup"
        (ngSubmit)="onCreateInstructionAccount(instruction.id)"
      >
        <label> Name: <input formControlName="name" type="text" /> </label>

        <label>
          Collection:
          <select
            *ngrxLet="collections$; let collections"
            formControlName="collectionId"
          >
            <option
              *ngFor="let collection of collections"
              [ngValue]="collection.pubkey"
            >
              {{ collection.info.name }} |
              {{ collection.pubkey.toBase58() | obscureAddress }}
            </option>
          </select>
        </label>

        <label>
          Kind:
          <select formControlName="kind">
            <option [ngValue]="0">Account</option>
            <option [ngValue]="1">Signer</option>
            <option [ngValue]="2">Program</option>
          </select>
        </label>

        <button>Submit</button>
      </form>

      <ul>
        <li *ngFor="let account of instruction.accounts">
          <h4>Name: {{ account.data.name }}</h4>
          <p>Kind: {{ account.data.kind }}</p>
          <p>
            Collection:
            {{ account.data.collection.toBase58() | obscureAddress }}
            <a
              [routerLink]="[
                '/collections',
                account.data.application.toBase58(),
                account.data.collection.toBase58()
              ]"
              >view</a
            >
          </p>

          <div>
            Bool Attribute:
            <button
              (click)="onSetBoolAttribute(account, instruction.id, null)"
              [ngClass]="{ selected: account.boolAttribute === null }"
            >
              None
            </button>
            <button
              (click)="onSetBoolAttribute(account, instruction.id, 0)"
              [ngClass]="{
                selected:
                  account.boolAttribute &&
                  account.boolAttribute.data.kind === 'init'
              }"
            >
              Init
            </button>
            <button
              (click)="onSetBoolAttribute(account, instruction.id, 1)"
              [ngClass]="{
                selected:
                  account.boolAttribute &&
                  account.boolAttribute.data.kind === 'mut'
              }"
            >
              Mut
            </button>
            <button
              (click)="onSetBoolAttribute(account, instruction.id, 2)"
              [ngClass]="{
                selected:
                  account.boolAttribute &&
                  account.boolAttribute.data.kind === 'zero'
              }"
            >
              Zero
            </button>
          </div>
        </li>
      </ul>
    </section>
  `,
  styles: [
    `
      .selected {
        border: 2px solid red;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructionComponent {
  readonly createInstructionArgumentGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    kind: new FormControl(0, { validators: [Validators.required] }),
    modifier: new FormControl(0, { validators: [Validators.required] }),
    size: new FormControl(1),
  });
  get instructionArgumentNameControl() {
    return this.createInstructionArgumentGroup.get('name') as FormControl;
  }
  get instructionArgumentKindControl() {
    return this.createInstructionArgumentGroup.get('kind') as FormControl;
  }
  get instructionArgumentModifierControl() {
    return this.createInstructionArgumentGroup.get('modifier') as FormControl;
  }
  get instructionArgumentSizeControl() {
    return this.createInstructionArgumentGroup.get('size') as FormControl;
  }

  readonly createInstructionAccountGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    collectionId: new FormControl(null, { validators: [Validators.required] }),
    kind: new FormControl(0, { validators: [Validators.required] }),
  });
  get instructionAccountNameControl() {
    return this.createInstructionAccountGroup.get('name') as FormControl;
  }
  get instructionAccountCollectionIdControl() {
    return this.createInstructionAccountGroup.get(
      'collectionId'
    ) as FormControl;
  }
  get instructionAccountKindControl() {
    return this.createInstructionAccountGroup.get('kind') as FormControl;
  }

  readonly instruction$ = this._route.paramMap.pipe(
    switchMap((paramMap) => {
      const instructionId = paramMap.get('instructionId');

      return instructionId
        ? this.getInstruction(new PublicKey(instructionId))
        : of(null);
    })
  );
  readonly collections$ = this._route.paramMap.pipe(
    switchMap((paramMap) => {
      const applicationId = paramMap.get('applicationId');

      return applicationId
        ? this._demobaseService.getCollectionsByApplication(
            new PublicKey(applicationId)
          )
        : of(null);
    })
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _demobaseService: DemobaseService
  ) {}

  private async getInstruction(instructionId: PublicKey) {
    const [
      instruction,
      instructionArguments,
      instructionAccounts,
      instructionAccountBoolAttributes,
    ] = await Promise.all([
      this._demobaseService.getCollectionInstruction(instructionId),
      this._demobaseService.getCollectionInstructionArguments(instructionId),
      this._demobaseService.getCollectionInstructionAccounts(instructionId),
      this._demobaseService.getCollectionInstructionBoolAttributes(
        instructionId
      ),
    ]);

    return {
      id: instruction?.pubkey.toBase58(),
      data: instruction?.info,
      arguments: instructionArguments.map(({ pubkey, info }) => ({
        id: pubkey.toBase58(),
        data: info,
      })),
      accounts: instructionAccounts.map(({ pubkey, info }) => ({
        id: pubkey.toBase58(),
        data: info,
        boolAttribute: instructionAccountBoolAttributes
          .filter(({ info }) => info.account.equals(pubkey))
          .reduce(
            (
              _: { id: string; data: AccountBoolAttributeInfo } | null,
              attribute
            ) => ({
              id: attribute.pubkey.toBase58(),
              data: attribute.info,
            }),
            null
          ),
      })),
    };
  }

  onCreateInstructionArgument(instructionId: string) {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (
      this.createInstructionArgumentGroup.valid &&
      applicationId &&
      collectionId
    ) {
      const name = this.instructionArgumentNameControl.value;
      const kind = this.instructionArgumentKindControl.value;
      const modifier = this.instructionArgumentModifierControl.value;
      const size = this.instructionArgumentSizeControl.value;

      this._demobaseService.createCollectionInstructionArgument(
        new PublicKey(applicationId),
        new PublicKey(collectionId),
        new PublicKey(instructionId),
        name,
        kind,
        modifier,
        size
      );
    }
  }

  onCreateInstructionAccount(instructionId: string) {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (
      this.createInstructionAccountGroup.valid &&
      applicationId &&
      collectionId
    ) {
      const name = this.instructionAccountNameControl.value;
      const collectionId = this.instructionAccountCollectionIdControl.value;
      const kind = this.instructionAccountKindControl.value;

      this._demobaseService.createCollectionInstructionAccount(
        new PublicKey(applicationId),
        new PublicKey(collectionId),
        new PublicKey(instructionId),
        name,
        kind
      );
    }
  }

  onSetBoolAttribute(
    account: {
      id: string;
      data: InstructionAccountInfo;
      boolAttribute: { id: string; data: AccountBoolAttributeInfo } | null;
    },
    instructionId: string,
    kind: AccountBoolAttributeKind | null
  ) {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (applicationId && collectionId) {
      if (account.boolAttribute === null) {
        if (kind !== null) {
          this._demobaseService.createCollectionInstructionAccountBoolAttribute(
            new PublicKey(applicationId),
            new PublicKey(collectionId),
            new PublicKey(instructionId),
            new PublicKey(account.id),
            kind
          );
        }
      } else {
        if (kind === null) {
          this._demobaseService.deleteCollectionInstructionAccountBoolAttribute(
            new PublicKey(account.boolAttribute.id)
          );
        } else {
          this._demobaseService.updateCollectionInstructionAccountBoolAttribute(
            new PublicKey(account.boolAttribute.id),
            kind
          );
        }
      }
    }
  }
}
