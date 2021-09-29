import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { Collection, DemobaseService } from '@demobase-labs/demobase-sdk';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActiveBreakpointService } from '../core/services/active-breakpoint.service';
import { EditCollectionComponent } from '../shared/components/edit-collection.component';

@Component({
  selector: 'demobase-collections',
  template: `
    <header demobasePageHeader>
      <h1>
        Collections
        <button
          mat-icon-button
          color="primary"
          aria-label="Reload collections list"
          (click)="onReload()"
        >
          <mat-icon>refresh</mat-icon>
        </button>
      </h1>
      <p>Visualize all collections.</p>
    </header>

    <main>
      <section *ngrxLet="collections$; let collections">
        <mat-grid-list
          *ngIf="collections.length > 0; else emptyList"
          [cols]="gridCols$ | ngrxPush"
          rowHeight="10rem"
          gutterSize="16"
        >
          <mat-grid-tile
            *ngFor="let collection of collections"
            [colspan]="1"
            [rowspan]="1"
            class="overflow-visible"
          >
            <mat-card class="w-full h-full">
              <h2>{{ collection.data.name }}</h2>

              <p>
                <a
                  [routerLink]="[
                    '/collections',
                    collection.data.application,
                    collection.id
                  ]"
                >
                  view
                </a>
              </p>

              <button
                mat-mini-fab
                color="primary"
                [disabled]="(connected$ | ngrxPush) === false"
                [attr.aria-label]="
                  'Edit ' + collection.data.name + ' collection'
                "
                (click)="onEditCollection(collection)"
              >
                <mat-icon>edit</mat-icon>
              </button>
            </mat-card>
          </mat-grid-tile>
        </mat-grid-list>

        <ng-template #emptyList>
          <p class="text-center text-xl">There's no collections yet.</p>
        </ng-template>
      </section>

      <button
        *ngIf="connected$ | ngrxPush"
        class="block fixed right-4 bottom-4"
        mat-fab
        color="primary"
        aria-label="Create collection"
        (click)="onEditCollection()"
      >
        <mat-icon>add</mat-icon>
      </button>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsComponent implements OnInit {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  private readonly _collections = new BehaviorSubject<Collection[]>([]);
  readonly collections$ = this._collections.asObservable();
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
    private readonly _demobaseService: DemobaseService,
    private readonly _matDialog: MatDialog,
    private readonly _activeBreakpointService: ActiveBreakpointService
  ) {}

  ngOnInit() {
    this._getCollections();
  }

  private async _getCollections() {
    try {
      const collections = await this._demobaseService.getCollections();
      this._collections.next(collections);
    } catch (error) {
      console.error(error);
    }
  }

  onReload() {
    this._getCollections();
  }

  onEditCollection(collection?: Collection) {
    this._matDialog.open(EditCollectionComponent, { data: { collection } });
  }
}
