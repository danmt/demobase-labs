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
      <ul *ngrxLet="applications$; let applications">
        <li *ngFor="let application of applications">
          {{ application.data.name }}

          <a [routerLink]="['/applications', application.id]">view</a>
        </li>
      </ul>

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

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _demobaseService: DemobaseService,
    private readonly _matDialog: MatDialog
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
