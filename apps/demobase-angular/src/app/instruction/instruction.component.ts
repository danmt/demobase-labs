import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { PublicKey } from '@solana/web3.js';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'demobase-instruction',
  template: `
    <section *ngIf="instructionAccount$ | ngrxPush as instructionAccount">
      <h2>{{ instructionAccount.info.name }}</h2>
      <p>Visualize all the details about this application.</p>

      <h3>Arguments</h3>

      <form
        [formGroup]="createInstructionArgumentGroup"
        (ngSubmit)="onCreateInstructionArgument(instructionAccount.pubkey)"
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

      <ul
        *ngrxLet="instructionArgumentAccounts$; let instructionArgumentAccounts"
      >
        <li
          *ngFor="let instructionArgumentAccount of instructionArgumentAccounts"
        >
          <p>Name: {{ instructionArgumentAccount.info.name }}</p>
          <p>Type: {{ instructionArgumentAccount.info.argumentType }}</p>
        </li>
      </ul>
    </section>
  `,
  styles: [],
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

  readonly instructionAccount$ = this._route.paramMap.pipe(
    switchMap((paramMap) => {
      const instructionId = paramMap.get('instructionId');

      return instructionId
        ? this._demobaseService.getCollectionInstruction(
            new PublicKey(instructionId)
          )
        : of(null);
    })
  );
  readonly instructionArgumentAccounts$ = this._route.paramMap.pipe(
    switchMap((paramMap) => {
      const instructionId = paramMap.get('instructionId');

      return instructionId
        ? this._demobaseService.getCollectionInstructionArguments(
            new PublicKey(instructionId)
          )
        : of(null);
    })
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _demobaseService: DemobaseService
  ) {}

  onCreateInstructionArgument(instructionId: PublicKey) {
    if (this.createInstructionArgumentGroup.valid) {
      const name = this.instructionArgumentNameControl.value;
      const type = this.instructionArgumentIsArrayControl.value
        ? `[${this.instructionArgumentTypeControl.value}; ${this.instructionArgumentLengthControl.value}]`
        : this.instructionArgumentTypeControl.value;

      this._demobaseService.createCollectionInstructionArgument(
        instructionId,
        name,
        type
      );
    }
  }
}
