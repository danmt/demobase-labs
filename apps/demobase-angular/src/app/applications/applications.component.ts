import { Component, HostBinding } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { defer, from } from 'rxjs';

@Component({
  selector: 'demobase-applications',
  template: `
    <header demobasePageHeader>
      <h1>Applications</h1>
      <p>Visualize all applications.</p>
    </header>

    <main>
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
    </main>
  `,
})
export class ApplicationsComponent {
  @HostBinding('class') class = 'block p-4';
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
