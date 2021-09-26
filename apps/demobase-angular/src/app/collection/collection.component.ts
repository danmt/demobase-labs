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
  Collection,
  CollectionAttribute,
  CollectionInstruction,
  DemobaseService,
} from '@demobase-labs/demobase-sdk';
import { BehaviorSubject } from 'rxjs';

import { CreateAttributeComponent } from './create-attribute.component';
import { CreateInstructionComponent } from './create-instruction.component';

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
        <section>
          <h2>Attributes</h2>

          <ul *ngrxLet="attributes$; let attributes">
            <li *ngFor="let attribute of attributes">
              <p>Name: {{ attribute.data.name }}.</p>
              <p>
                Kind: {{ attribute.data.kind.name }} ({{
                  attribute.data.kind.size
                }}
                bytes).
              </p>
              <p>
                Modifier: {{ attribute.data.modifier.name }} ({{
                  attribute.data.modifier.size
                }}).
              </p>
              <p>
                Total size:
                {{ attribute.data.kind.size * attribute.data.modifier.size }}
                bytes.
              </p>
            </li>
          </ul>
        </section>

        <section>
          <h2>Instructions</h2>

          <ul *ngrxLet="instructions$; let instructions">
            <li *ngFor="let instruction of instructions">
              <p>Name: {{ instruction.data.name }}</p>
              <a
                [routerLink]="[
                  '/instructions',
                  collection.data.application,
                  collection.id,
                  instruction.id
                ]"
                >view</a
              >
            </li>
          </ul>
        </section>

        <button
          *ngIf="connected$ | ngrxPush"
          class="block fixed right-4 bottom-4"
          mat-fab
          color="primary"
          aria-label="Create options"
          [matMenuTriggerFor]="createMenu"
        >
          <mat-icon>add</mat-icon>
        </button>
        <mat-menu #createMenu="matMenu" xPosition="before" yPosition="above">
          <button mat-menu-item (click)="onCreateCollectionAttribute()">
            Create attribute
          </button>
          <button mat-menu-item (click)="onCreateCollectionInstruction()">
            Create instruction
          </button>
        </mat-menu>
      </main>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionComponent implements OnInit {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  private readonly _collection = new BehaviorSubject<Collection | null>(null);
  readonly collection$ = this._collection.asObservable();
  private readonly _attributes = new BehaviorSubject<
    CollectionAttribute[] | null
  >(null);
  readonly attributes$ = this._attributes.asObservable();
  private readonly _instructions = new BehaviorSubject<
    CollectionInstruction[] | null
  >(null);
  readonly instructions$ = this._instructions.asObservable();

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _walletStore: WalletStore,
    private readonly _demobaseService: DemobaseService,
    private readonly _matDialog: MatDialog
  ) {}

  ngOnInit() {
    this._getCollection();
    this._getAttributes();
    this._getInstructions();
  }

  private async _getCollection() {
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (collectionId) {
      try {
        const collection = await this._demobaseService.getCollection(
          collectionId
        );
        this._collection.next(collection);
      } catch (error) {
        console.error(error);
      }
    }
  }

  private async _getAttributes() {
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (collectionId) {
      try {
        const attributes = await this._demobaseService.getCollectionAttributes(
          collectionId
        );
        this._attributes.next(attributes);
      } catch (error) {
        console.error(error);
      }
    }
  }

  private async _getInstructions() {
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (collectionId) {
      try {
        const instructions =
          await this._demobaseService.getCollectionInstructions(collectionId);
        this._instructions.next(instructions);
      } catch (error) {
        console.error(error);
      }
    }
  }

  onReload() {
    this._getCollection();
    this._getAttributes();
    this._getInstructions();
  }

  onCreateCollectionAttribute() {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (applicationId && collectionId) {
      this._matDialog.open(CreateAttributeComponent, {
        data: { applicationId, collectionId },
      });
    }
  }

  onCreateCollectionInstruction() {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (applicationId && collectionId) {
      this._matDialog.open(CreateInstructionComponent, {
        data: { applicationId, collectionId },
      });
    }
  }
}
