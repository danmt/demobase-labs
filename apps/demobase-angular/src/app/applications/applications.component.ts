import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { defer, from } from 'rxjs';

@Component({
  selector: 'demobase-applications',
  template: `
    <section>
      <h2>Applications</h2>

      <form
        [formGroup]="createApplicationGroup"
        (ngSubmit)="onCreateApplication()"
      >
        <label> Name: <input formControlName="name" type="text" /> </label>

        <button>Submit</button>
      </form>

      <ul *ngrxLet="applicationAccounts$; let applicationAccounts">
        <li *ngFor="let applicationAccount of applicationAccounts">
          {{ applicationAccount.info.name }}

          <a
            [routerLink]="[
              '/applications',
              applicationAccount.pubkey.toBase58()
            ]"
            >view</a
          >
        </li>
      </ul>
    </section>
  `,
})
export class ApplicationsComponent {
  readonly createApplicationGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
  });
  readonly applicationAccounts$ = from(
    defer(() => this._demobaseService.getApplications())
  );

  get applicationNameControl() {
    return this.createApplicationGroup.get('name') as FormControl;
  }

  constructor(private readonly _demobaseService: DemobaseService) {}

  onCreateApplication() {
    if (this.createApplicationGroup.valid) {
      this._demobaseService.createApplication(
        this.applicationNameControl.value
      );
    }
  }
}
