import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { CollectionAttribute } from '@demobase-labs/demobase-sdk';
import { map } from 'rxjs/operators';

import { ActiveBreakpointService } from '../core/services/active-breakpoint.service';
import { CollectionStore } from './collection.store';

@Component({
  selector: 'demobase-collection',
  template: `
    <ng-container *ngIf="collection$ | ngrxPush as collection">
      <header demobasePageHeader>
        <h1>
          {{ collection.data.name }}
          <button
            mat-icon-button
            color="primary"
            aria-label="Reload collection"
            (click)="onReload()"
          >
            <mat-icon>refresh</mat-icon>
          </button>
        </h1>
        <p>Visualize all the details about this collection.</p>
      </header>

      <main>
        <section *ngrxLet="attributes$; let attributes">
          <h2>
            Attributes
            <button
              mat-icon-button
              (click)="onCreateAttribute()"
              [disabled]="(connected$ | ngrxPush) === false"
              aria-label="Create attribute"
            >
              <mat-icon>add</mat-icon>
            </button>
          </h2>

          <mat-grid-list
            *ngIf="attributes.length > 0; else emptyList"
            [cols]="gridCols$ | ngrxPush"
            rowHeight="11rem"
            gutterSize="16"
          >
            <mat-grid-tile
              *ngFor="let attribute of attributes"
              [colspan]="1"
              [rowspan]="1"
              class="overflow-visible"
            >
              <mat-card class="w-full h-full">
                <h3>Name: {{ attribute.data.name }}.</h3>
                <p>Kind: {{ attribute.data.kind.name }}.</p>
                <p>
                  Modifier: {{ attribute.data.modifier.name }} ({{
                    attribute.data.modifier.size
                  }}).
                </p>
                <button
                  mat-mini-fab
                  color="primary"
                  [attr.aria-label]="
                    'Edit ' + attribute.data.name + ' attribute'
                  "
                  [disabled]="(connected$ | ngrxPush) === false"
                  (click)="onEditAttribute(attribute)"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-mini-fab
                  color="warn"
                  [attr.aria-label]="
                    'Delete ' + attribute.data.name + ' attribute'
                  "
                  [disabled]="(connected$ | ngrxPush) === false"
                  (click)="onDeleteAttribute(attribute.id)"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card>
            </mat-grid-tile>
          </mat-grid-list>

          <ng-template #emptyList>
            <p class="text-center text-xl">There's no attributes yet.</p>
          </ng-template>
        </section>
      </main>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CollectionStore],
})
export class CollectionComponent {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  readonly collection$ = this._collectionStore.collection$;
  readonly attributes$ = this._collectionStore.attributes$;
  readonly gridCols$ = this._activeBreakpointService.activeBreakpoint$.pipe(
    map((activeBreakpoint) => {
      switch (activeBreakpoint) {
        case 'xs':
          return 1;
        case 'sm':
          return 2;
        case 'md':
        case 'lg':
          return 3;
        default:
          return 4;
      }
    })
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _activeBreakpointService: ActiveBreakpointService,
    private readonly _collectionStore: CollectionStore
  ) {}

  onReload() {
    this._collectionStore.reload();
  }

  onCreateAttribute() {
    this._collectionStore.createCollectionAttribute();
  }

  onEditAttribute(attribute: CollectionAttribute) {
    this._collectionStore.updateCollectionAttribute(attribute);
  }

  onDeleteAttribute(attributeId: string) {
    this._collectionStore.deleteCollectionAttribute(attributeId);
  }
}
