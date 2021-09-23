import { ChangeDetectionStrategy, Component } from '@angular/core';
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
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructionComponent {
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

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _demobaseService: DemobaseService
  ) {}
}
