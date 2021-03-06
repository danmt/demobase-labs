import { Component, HostBinding, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Collection,
  InstructionBasicAccount,
} from '@demobase-labs/demobase-sdk';

@Component({
  selector: 'demobase-labs-edit-basic-account',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      {{ data?.account ? 'Edit' : 'Create' }} account
    </h2>

    <form
      [formGroup]="accountGroup"
      class="flex flex-col gap-4"
      (ngSubmit)="onEditBasicAccount()"
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
        hintLabel="Select a collection."
      >
        <mat-label>Collection</mat-label>
        <mat-select formControlName="collection">
          <mat-option
            *ngFor="let collection of data?.collections"
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
        {{ data?.account ? 'Save' : 'Create' }}
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
export class EditBasicAccountComponent implements OnInit {
  @HostBinding('class') class = 'block w-72 relative';
  submitted = false;
  readonly accountGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    collection: new FormControl(null, { validators: [Validators.required] }),
    markAttribute: new FormControl(0, { validators: [Validators.required] }),
  });
  get nameControl() {
    return this.accountGroup.get('name') as FormControl;
  }
  get collectionControl() {
    return this.accountGroup.get('collection') as FormControl;
  }
  get markAttributeControl() {
    return this.accountGroup.get('markAttribute') as FormControl;
  }

  constructor(
    private readonly _matDialogRef: MatDialogRef<EditBasicAccountComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      account?: InstructionBasicAccount;
      collections: Collection[];
    }
  ) {}

  ngOnInit() {
    if (this.data?.account) {
      this.accountGroup.setValue(
        {
          name: this.data.account.data.name,
          collection: this.data.account.data.collection,
          markAttribute: this.data.account.data.markAttribute.id,
        },
        { emitEvent: false }
      );
    }
  }

  async onEditBasicAccount() {
    this.submitted = true;
    this.accountGroup.markAllAsTouched();

    if (this.accountGroup.valid) {
      this._matDialogRef.close({
        name: this.nameControl.value,
        markAttribute: this.markAttributeControl.value,
        collection: this.collectionControl.value,
      });
    }
  }
}
