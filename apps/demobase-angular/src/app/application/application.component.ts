import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import {
  Application,
  Collection,
  DemobaseService,
} from '@demobase-labs/demobase-sdk';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActiveBreakpointService } from '../core/services/active-breakpoint.service';
import { CreateCollectionComponent } from './create-collection.component';

@Component({
  selector: 'demobase-application',
  template: `
    <ng-container *ngIf="application$ | ngrxPush as application">
      <header demobasePageHeader>
        <h1>
          {{ application.data.name }}
          <button
            mat-icon-button
            color="primary"
            aria-label="Reload application"
            (click)="onReload()"
          >
            <mat-icon>refresh</mat-icon>
          </button>
        </h1>
        <p>Visualize all the details about this application.</p>
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

                <a
                  [routerLink]="['/collections', application.id, collection.id]"
                >
                  view
                </a>
              </mat-card>
            </mat-grid-tile>
          </mat-grid-list>

          <ng-template #emptyList>
            <p class="text-center text-xl">
              This application doesn't have collections yet.
            </p>
          </ng-template>
        </section>

        <button
          *ngIf="connected$ | ngrxPush"
          class="block fixed right-4 bottom-4"
          mat-fab
          color="primary"
          aria-label="Create collection"
          (click)="onCreateCollection()"
        >
          <mat-icon>add</mat-icon>
        </button>
      </main>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationComponent implements OnInit {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  private readonly _application = new BehaviorSubject<Application | null>(null);
  readonly application$ = this._application.asObservable();
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
    private readonly _route: ActivatedRoute,
    private readonly _demobaseService: DemobaseService,
    private readonly _walletStore: WalletStore,
    private readonly _matDialog: MatDialog,
    private readonly _activeBreakpointService: ActiveBreakpointService
  ) {}

  ngOnInit() {
    this._getApplication();
    this._getCollections();
  }

  private async _getApplication() {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');

    if (applicationId) {
      try {
        const application = await this._demobaseService.getApplication(
          applicationId
        );
        this._application.next(application);
      } catch (error) {
        console.error(error);
      }
    }
  }

  private async _getCollections() {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');

    if (applicationId) {
      try {
        const collections =
          await this._demobaseService.getCollectionsByApplication(
            applicationId
          );
        this._collections.next(collections);
      } catch (error) {
        console.error(error);
      }
    }
  }

  onReload() {
    this._getApplication();
    this._getCollections();
  }

  onCreateCollection() {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');

    if (applicationId) {
      this._matDialog.open(CreateCollectionComponent, {
        data: applicationId,
      });
    }
  }
}
