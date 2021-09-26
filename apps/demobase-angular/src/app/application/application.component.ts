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
        <ul *ngrxLet="collections$; let collections">
          <li *ngFor="let collection of collections">
            {{ collection.data.name }}

            <a [routerLink]="['/collections', application.id, collection.id]"
              >view</a
            >
          </li>
        </ul>

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

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _demobaseService: DemobaseService,
    private readonly _walletStore: WalletStore,
    private readonly _matDialog: MatDialog
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
