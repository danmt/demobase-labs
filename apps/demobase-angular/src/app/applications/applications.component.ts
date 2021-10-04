import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { Application } from '@demobase-labs/demobase-sdk';
import { map } from 'rxjs/operators';

import { ActiveBreakpointService } from '../core/services/active-breakpoint.service';
import { ApplicationsStore } from './applications.store';

@Component({
  selector: 'demobase-applications',
  template: `
    <header demobasePageHeader>
      <h1>
        Applications
        <button
          mat-icon-button
          color="primary"
          aria-label="Reload applications list"
          (click)="onReload()"
        >
          <mat-icon>refresh</mat-icon>
        </button>
      </h1>
      <p>Visualize all applications.</p>
    </header>

    <main>
      <section *ngrxLet="applications$; let applications">
        <mat-grid-list
          *ngIf="applications.length > 0; else emptyList"
          [cols]="gridCols$ | ngrxPush"
          rowHeight="10rem"
          gutterSize="16"
        >
          <mat-grid-tile
            *ngFor="let application of applications"
            [colspan]="1"
            [rowspan]="1"
            class="overflow-visible"
          >
            <mat-card class="w-full h-full">
              <h2>{{ application.data.name }}</h2>
              <p>
                <a [routerLink]="['/applications', application.id]">view</a>
              </p>
              <button
                mat-mini-fab
                color="primary"
                [attr.aria-label]="
                  'Edit ' + application.data.name + ' application'
                "
                [disabled]="(connected$ | ngrxPush) === false"
                (click)="onEditApplication(application)"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-mini-fab
                color="warn"
                [disabled]="(connected$ | ngrxPush) === false"
                [attr.aria-label]="
                  'Delete ' + application.data.name + ' application'
                "
                (click)="onDeleteApplication(application.id)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </mat-card>
          </mat-grid-tile>
        </mat-grid-list>

        <ng-template #emptyList>
          <p class="text-center text-xl">There's no applications yet.</p>
        </ng-template>
      </section>

      <button
        *ngIf="connected$ | ngrxPush"
        class="block fixed right-4 bottom-4"
        mat-fab
        color="primary"
        aria-label="Create application"
        (click)="onCreateApplication()"
      >
        <mat-icon>add</mat-icon>
      </button>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApplicationsStore],
})
export class ApplicationsComponent {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  readonly applications$ = this._applicationsStore.applications$;
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
    private readonly _applicationsStore: ApplicationsStore,
    private readonly _activeBreakpointService: ActiveBreakpointService
  ) {}

  onReload() {
    this._applicationsStore.reload();
  }

  onCreateApplication() {
    this._applicationsStore.createApplication();
  }

  onEditApplication(application: Application) {
    this._applicationsStore.updateApplication(application);
  }

  onDeleteApplication(applicationId: string) {
    this._applicationsStore.deleteApplication(applicationId);
  }
}
