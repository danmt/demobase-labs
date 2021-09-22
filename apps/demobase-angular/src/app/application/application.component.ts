import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { PublicKey } from '@solana/web3.js';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'demobase-application',
  template: `
    <section>
      <h2>Application</h2>

      <ng-container
        *ngIf="applicationAccount$ | ngrxPush as applicationAccount"
      >
        {{ applicationAccount.info.name }}
      </ng-container>
    </section>
  `,
})
export class ApplicationComponent {
  readonly applicationAccount$ = this._route.paramMap.pipe(
    switchMap((paramMap) => {
      const applicationId = paramMap.get('applicationId');

      return applicationId
        ? this._demobaseService.getApplication(new PublicKey(applicationId))
        : of(null);
    })
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _demobaseService: DemobaseService
  ) {}
}
