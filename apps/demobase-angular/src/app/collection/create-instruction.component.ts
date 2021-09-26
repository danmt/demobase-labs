import { Component, HostBinding, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DemobaseService } from '@demobase-labs/demobase-sdk';

@Component({
  selector: 'demobase-create-instruction',
  template: `
    <h2 mat-dialog-title class="mat-primary">Create instruction</h2>

    <form
      [formGroup]="instructionGroup"
      class="flex flex-col gap-4"
      (ngSubmit)="onCreateInstruction()"
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

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && instructionGroup.invalid"
      >
        Create
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close create instruction form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class CreateInstructionComponent {
  @HostBinding('class') class = 'block w-72 relative';
  submitted = false;
  readonly instructionGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
  });

  get nameControl() {
    return this.instructionGroup.get('name') as FormControl;
  }

  constructor(
    private readonly _demobaseService: DemobaseService,
    private readonly _matDialogRef: MatDialogRef<CreateInstructionComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { applicationId: string; collectionId: string }
  ) {}

  async onCreateInstruction() {
    this.submitted = true;
    this.instructionGroup.markAllAsTouched();

    if (this.instructionGroup.valid) {
      await this._demobaseService.createCollectionInstruction(
        this.data.applicationId,
        this.data.collectionId,
        this.nameControl.value
      );
      this._matDialogRef.close();
    }
  }
}
