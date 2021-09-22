import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { PublicKey } from '@solana/web3.js';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'demobase-collection',
  template: `
    <section *ngIf="collectionAccount$ | ngrxPush as collectionAccount">
      <h2>{{ collectionAccount.info.name }}</h2>
      <p>Visualize all the details about this application.</p>
    </section>
  `,
})
export class CollectionComponent {
  readonly collectionAccount$ = this._route.paramMap.pipe(
    switchMap((paramMap) => {
      const applicationId = paramMap.get('applicationId');
      const collectionName = paramMap.get('collectionName');
      const collectionBump = paramMap.get('collectionBump');

      return applicationId && collectionName && collectionBump
        ? this._demobaseService.getCollection(
            new PublicKey(applicationId),
            collectionName,
            parseInt(collectionBump)
          )
        : of(null);
    })
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _demobaseService: DemobaseService
  ) {}
}
