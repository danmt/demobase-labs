import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
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
import { map, shareReplay } from 'rxjs/operators';

import { ActiveBreakpointService } from '../core/services/active-breakpoint.service';
import { EditApplicationComponent } from '../shared/components/edit-application.component';
import { EditCollectionComponent } from '../shared/components/edit-collection.component';

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
          <mat-sidenav-container class="sidenav-container" fullscreen>
            <mat-sidenav
              #drawer
              class="sidenav"
              [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
              [mode]="(isHandset$ | async) ? 'over' : 'side'"
              [opened]="(isHandset$ | async) === false"
            >
              <h2 class="mt-4 text-center">Collections</h2>
              <mat-nav-list *ngIf="collections.length > 0; else emptyList">
                <a
                  *ngFor="let collection of collections"
                  mat-list-item
                  [routerLink]="['collections', collection.id]"
                >
                  {{ collection.data.name }}
                </a>
              </mat-nav-list>
            </mat-sidenav>
            <mat-sidenav-content>
              <router-outlet></router-outlet>
            </mat-sidenav-content>
          </mat-sidenav-container>

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
          aria-label="Create options"
          [matMenuTriggerFor]="createMenu"
        >
          <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #createMenu="matMenu" xPosition="before" yPosition="above">
          <button mat-menu-item (click)="onEditCollection()">
            New collection
          </button>
          <button mat-menu-item (click)="onEditApplication(application)">
            Edit application
          </button>
        </mat-menu>
      </main>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .sidenav-container {
        height: calc(100% + 9.5rem);
        top: 9.5rem;
      }

      .sidenav {
        width: 200px;
      }

      .sidenav .mat-toolbar {
        background: inherit;
      }
    `,
  ],
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
  readonly isHandset$ = this._breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _demobaseService: DemobaseService,
    private readonly _walletStore: WalletStore,
    private readonly _matDialog: MatDialog,
    private readonly _activeBreakpointService: ActiveBreakpointService,
    private readonly _breakpointObserver: BreakpointObserver
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

  onEditCollection(collection?: Collection) {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');

    if (applicationId) {
      this._matDialog.open(EditCollectionComponent, {
        data: {
          applicationId: !collection && applicationId,
          collection,
        },
      });
    }
  }

  onDeleteCollection(collectionId: string) {
    if (confirm('Are you sure? This action cannot be reverted.')) {
      this._demobaseService.deleteCollection(collectionId);
    }
  }

  onEditApplication(application: Application) {
    this._matDialog.open(EditApplicationComponent, { data: { application } });
  }

  onDeleteApplication(applicationId: string) {
    if (confirm('Are you sure? This action cannot be reverted.')) {
      this._demobaseService.deleteApplication(applicationId);
    }
  }
}
