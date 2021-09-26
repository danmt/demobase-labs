import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Application, DemobaseService } from '@demobase-labs/demobase-sdk';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'demobase-create-collection',
  template: `
    <h2 mat-dialog-title class="mat-primary">Create collection</h2>

    <form
      [formGroup]="collectionGroup"
      class="flex flex-col gap-4"
      (ngSubmit)="onCreateCollection()"
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
        hintLabel="Select an application."
      >
        <mat-label>Application</mat-label>
        <mat-select formControlName="application">
          <mat-option
            *ngFor="let application of applications$ | ngrxPush"
            [value]="application.id"
          >
            {{ application.data.name }} |
            {{ application.id | obscureAddress }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="submitted && nameControl.errors?.maxlength"
          >The application is required.</mat-error
        >
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && collectionGroup.invalid"
      >
        Create
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close create collection form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class CreateCollectionComponent implements OnInit {
  @HostBinding('class') class = 'block w-72 relative';
  submitted = false;
  readonly collectionGroup = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(32)],
    }),
    application: new FormControl('', { validators: [Validators.required] }),
  });
  get nameControl() {
    return this.collectionGroup.get('name') as FormControl;
  }
  get applicationControl() {
    return this.collectionGroup.get('application') as FormControl;
  }

  private readonly _applications = new BehaviorSubject<Application[]>([]);
  readonly applications$ = this._applications.asObservable();

  constructor(
    private readonly _demobaseService: DemobaseService,
    private readonly _matDialogRef: MatDialogRef<CreateCollectionComponent>
  ) {}

  ngOnInit() {
    this._getApplications();
  }

  private async _getApplications() {
    try {
      const applications = await this._demobaseService.getApplications();
      this._applications.next(applications);
    } catch (error) {
      console.error(error);
    }
  }

  async onCreateCollection() {
    this.submitted = true;
    this.collectionGroup.markAllAsTouched();

    if (this.collectionGroup.valid) {
      await this._demobaseService.createCollection(
        this.applicationControl.value,
        this.nameControl.value
      );
      this._matDialogRef.close();
    }
  }
}
