import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { Application, DemobaseService } from '@demobase-labs/demobase-sdk';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActiveBreakpointService } from '../core/services/active-breakpoint.service';
import { CreateApplicationComponent } from './create-application.component';

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

              <a [routerLink]="['/applications', application.id]">view</a>
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
})
export class ApplicationsComponent implements OnInit {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  private readonly _applications = new BehaviorSubject<Application[]>([]);
  readonly applications$ = this._applications.asObservable();
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
    this._getApplications();
  }

  private async _getApplications() {
    try {
      const applications = await this._demobaseService.getApplications();
      this._applications.next(applications);
    } catch (error) {
      console.error(error);
    }
  }

  onReload() {
    this._getApplications();
  }

  onCreateApplication() {
    this._matDialog.open(CreateApplicationComponent);
  }
}
