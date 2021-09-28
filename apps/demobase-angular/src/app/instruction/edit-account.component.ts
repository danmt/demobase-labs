import { Component, HostBinding, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Collection,
  DemobaseService,
  InstructionAccount,
} from '@demobase-labs/demobase-sdk';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'demobase-edit-account',
  template: `
    <h2 mat-dialog-title class="mat-primary">Edit account</h2>

    <form
      [formGroup]="accountGroup"
      class="flex flex-col gap-4"
      (ngSubmit)="onEditAccount()"
    >
      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Enter the name."
      >
        <mat-label>Name</mat-label>
        <input
          matInput
          formControlName="name"
          required
          autocomplete="off"
          maxlength="32"
        />
        <mat-hint align="end">{{ nameControl.value?.length || 0 }}/32</mat-hint>

        <mat-error *ngIf="submitted && nameControl.errors?.required"
          >The name is mandatory.</mat-error
        >
        <mat-error *ngIf="submitted && nameControl.errors?.maxlength"
          >Maximum length is 32.</mat-error
        >
      </mat-form-field>

      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Select a kind."
      >
        <mat-label>Kind</mat-label>
        <mat-select formControlName="kind">
          <mat-option [value]="0">Account</mat-option>
          <mat-option [value]="1">Signer</mat-option>
          <mat-option [value]="2">Program</mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">The kind is required.</mat-error>
      </mat-form-field>

      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Select a collection."
      >
        <mat-label>Collection</mat-label>
        <mat-select formControlName="collection">
          <mat-option
            *ngFor="let collection of collections$ | ngrxPush"
            [value]="collection.id"
          >
            {{ collection.data.name }} |
            {{ collection.id | obscureAddress }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">The collection is required.</mat-error>
      </mat-form-field>

      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Select a mark attribute."
      >
        <mat-label>Mark attribute</mat-label>
        <mat-select formControlName="markAttribute">
          <mat-option [value]="0">None</mat-option>
          <mat-option [value]="1">Init</mat-option>
          <mat-option [value]="2">Mut</mat-option>
          <mat-option [value]="3">Zero</mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">The mark attribute is required.</mat-error>
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && accountGroup.invalid"
      >
        {{ data.account ? 'Save' : 'Create' }}
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close edit account form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class EditAccountComponent implements OnInit {
  @HostBinding('class') class = 'block w-72 relative';
  submitted = false;
  readonly accountGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    kind: new FormControl(0, { validators: [Validators.required] }),
    collection: new FormControl(null, { validators: [Validators.required] }),
    markAttribute: new FormControl(0, { validators: [Validators.required] }),
  });
  get nameControl() {
    return this.accountGroup.get('name') as FormControl;
  }
  get kindControl() {
    return this.accountGroup.get('kind') as FormControl;
  }
  get collectionControl() {
    return this.accountGroup.get('collection') as FormControl;
  }
  get markAttributeControl() {
    return this.accountGroup.get('markAttribute') as FormControl;
  }

  private readonly _collections = new BehaviorSubject<Collection[]>([]);
  readonly collections$ = this._collections.asObservable();

  constructor(
    private readonly _demobaseService: DemobaseService,
    private readonly _matDialogRef: MatDialogRef<EditAccountComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      applicationId: string;
      collectionId: string;
      instructionId: string;
      account?: InstructionAccount;
    }
  ) {}

  ngOnInit() {
    this._getCollections();

    if (this.data.account) {
      this.accountGroup.setValue(
        {
          name: this.data.account.data.name,
          kind: this.data.account.data.kind.id,
          collection: this.data.account.data.accountCollection,
          markAttribute: this.data.account.data.markAttribute.id,
        },
        { emitEvent: false }
      );
    }
  }

  private async _getCollections() {
    try {
      const collections = await this._demobaseService.getCollections();
      this._collections.next(collections);
    } catch (error) {
      console.error(error);
    }
  }

  async onEditAccount() {
    this.submitted = true;
    this.accountGroup.markAllAsTouched();

    if (this.accountGroup.valid) {
      const account = this.data.account;

      if (account) {
        await this._demobaseService.updateCollectionInstructionAccount(
          account.id,
          this.nameControl.value,
          this.kindControl.value,
          this.collectionControl.value,
          this.markAttributeControl.value
        );
      } else {
        await this._demobaseService.createCollectionInstructionAccount(
          this.data.applicationId,
          this.data.collectionId,
          this.data.instructionId,
          this.nameControl.value,
          this.kindControl.value,
          this.collectionControl.value,
          this.markAttributeControl.value
        );
      }
      this._matDialogRef.close();
    }
  }
}
