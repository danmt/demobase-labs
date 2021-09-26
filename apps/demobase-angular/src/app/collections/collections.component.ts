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

import { CreateCollectionComponent } from './create-collection.component';

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
      <ul *ngrxLet="collections$; let collections">
        <li *ngFor="let collection of collections">
          {{ collection.data.name }}

          <a
            [routerLink]="[
              '/collections',
              collection.data.application,
              collection.id
            ]"
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsComponent implements OnInit {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  private readonly _collections = new BehaviorSubject<Collection[]>([]);
  readonly collections$ = this._collections.asObservable();

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _demobaseService: DemobaseService,
    private readonly _matDialog: MatDialog
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

  onCreateCollection() {
    this._matDialog.open(CreateCollectionComponent);
  }
}
