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
import { map } from 'rxjs/operators';
import { ActiveBreakpointService } from '../core/services/active-breakpoint.service';
import { EditAttributeComponent } from '../shared/components/edit-attribute.component';
import { EditInstructionComponent } from '../shared/components/edit-instruction.component';

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
          <h2>Attributes</h2>

          <mat-grid-list
            *ngIf="attributes.length > 0; else emptyList"
            [cols]="gridCols$ | ngrxPush"
            rowHeight="13rem"
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
              </mat-card>
            </mat-grid-tile>
          </mat-grid-list>

          <ng-template #emptyList>
            <p class="text-center text-xl">There's no attributes yet.</p>
          </ng-template>
        </section>

        <section>
          <h2>Instructions</h2>

          <ng-container *ngrxLet="instructions$; let instructions">
            <mat-grid-list
              *ngIf="instructions.length > 0; else emptyList"
              [cols]="gridCols$ | ngrxPush"
              rowHeight="10rem"
              gutterSize="16"
            >
              <mat-grid-tile
                *ngFor="let instruction of instructions"
                [colspan]="1"
                [rowspan]="1"
                class="overflow-visible"
              >
                <mat-card class="w-full h-full">
                  <h3>Name: {{ instruction.data.name }}</h3>
                  <p>
                    <a
                      [routerLink]="[
                        '/instructions',
                        collection.data.application,
                        collection.id,
                        instruction.id
                      ]"
                      >view</a
                    >
                  </p>
                  <button
                    mat-mini-fab
                    color="primary"
                    [attr.aria-label]="
                      'Edit ' + instruction.data.name + ' instruction'
                    "
                    [disabled]="(connected$ | ngrxPush) === false"
                    (click)="onEditInstruction(instruction)"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                </mat-card>
              </mat-grid-tile>
            </mat-grid-list>
          </ng-container>

          <ng-template #emptyList>
            <p class="text-center text-xl">There's no instructions yet.</p>
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
          <mat-icon>add</mat-icon>
        </button>
        <mat-menu #createMenu="matMenu" xPosition="before" yPosition="above">
          <button mat-menu-item (click)="onEditAttribute()">
            New attribute
          </button>
          <button mat-menu-item (click)="onEditInstruction()">
            New instruction
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
  private readonly _attributes = new BehaviorSubject<CollectionAttribute[]>([]);
  readonly attributes$ = this._attributes.asObservable();
  private readonly _instructions = new BehaviorSubject<CollectionInstruction[]>(
    []
  );
  readonly instructions$ = this._instructions.asObservable();
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
    private readonly _walletStore: WalletStore,
    private readonly _demobaseService: DemobaseService,
    private readonly _matDialog: MatDialog,
    private readonly _activeBreakpointService: ActiveBreakpointService
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

  onEditAttribute(attribute?: CollectionAttribute) {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (applicationId && collectionId) {
      this._matDialog.open(EditAttributeComponent, {
        data: { applicationId, collectionId, attribute },
      });
    }
  }

  onEditInstruction(instruction?: CollectionInstruction) {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (applicationId && collectionId) {
      this._matDialog.open(EditInstructionComponent, {
        data: { applicationId, collectionId, instruction },
      });
    }
  }
}
