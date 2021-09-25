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
          <select formControlName="type">
            <option value="u8">u8</option>
            <option value="u16">u16</option>
            <option value="u32">u32</option>
            <option value="u64">u64</option>
            <option value="Pubkey">Pubkey</option>
            <option value="String">String</option>
          </select>
        </label>

        <label>
          Is Array? <input formControlName="isArray" type="checkbox" />
        </label>
        <label *ngIf="instructionArgumentIsArrayControl.value">
          Length: <input formControlName="length" type="number" />
        </label>

        <button>Submit</button>
      </form>

      <ul>
        <li *ngFor="let argument of instruction.arguments">
          <h4>Name: {{ argument.data.name }}</h4>
          <p>Type: {{ argument.data.argumentType }}</p>
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

        <fieldset>
          <legend>Kind:</legend>
          <label>
            Basic <input formControlName="kind" type="radio" value="0" />
          </label>
          <label>
            Signer <input formControlName="kind" type="radio" value="1" />
          </label>
          <label>
            Program
            <input formControlName="kind" type="radio" value="2" />
          </label>
        </fieldset>

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
    type: new FormControl(null, { validators: [Validators.required] }),
    isArray: new FormControl(0),
    length: new FormControl(1),
  });
  get instructionArgumentNameControl() {
    return this.createInstructionArgumentGroup.get('name') as FormControl;
  }
  get instructionArgumentTypeControl() {
    return this.createInstructionArgumentGroup.get('type') as FormControl;
  }
  get instructionArgumentIsArrayControl() {
    return this.createInstructionArgumentGroup.get('isArray') as FormControl;
  }
  get instructionArgumentLengthControl() {
    return this.createInstructionArgumentGroup.get('length') as FormControl;
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
      this._demobaseService.getCollectionInstruction(
        new PublicKey(instructionId)
      ),
      this._demobaseService.getCollectionInstructionArguments(
        new PublicKey(instructionId)
      ),
      this._demobaseService.getCollectionInstructionAccounts(
        new PublicKey(instructionId)
      ),
      this._demobaseService.getCollectionInstructionBoolAttributes(
        new PublicKey(instructionId)
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
    if (this.createInstructionArgumentGroup.valid) {
      const name = this.instructionArgumentNameControl.value;
      const type = this.instructionArgumentIsArrayControl.value
        ? `[${this.instructionArgumentTypeControl.value}; ${this.instructionArgumentLengthControl.value}]`
        : this.instructionArgumentTypeControl.value;

      this._demobaseService.createCollectionInstructionArgument(
        new PublicKey(instructionId),
        name,
        type
      );
    }
  }

  onCreateInstructionAccount(instructionId: string) {
    if (this.createInstructionAccountGroup.valid) {
      const name = this.instructionAccountNameControl.value;
      const collectionId = this.instructionAccountCollectionIdControl.value;
      const kind = this.instructionAccountKindControl.value;

      this._demobaseService.createCollectionInstructionAccount(
        new PublicKey(instructionId),
        name,
        kind,
        collectionId
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
    if (account.boolAttribute === null) {
      if (kind !== null) {
        this._demobaseService.createCollectionInstructionAccountBoolAttribute(
          new PublicKey(account.id),
          new PublicKey(instructionId),
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
