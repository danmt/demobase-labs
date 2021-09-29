import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import {
  Collection,
  CollectionAttribute,
  CollectionInstruction,
} from '@demobase-labs/demobase-sdk';
import { map } from 'rxjs/operators';

import { ActiveBreakpointService } from '../core/services/active-breakpoint.service';
import { CollectionStore } from './collection.store';

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
        <mat-tab-group mat-align-tabs="start">
          <mat-tab label="Instructions">
            <section *ngrxLet="instructions$; let instructions">
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
                    <button
                      mat-mini-fab
                      color="warn"
                      [disabled]="(connected$ | ngrxPush) === false"
                      [attr.aria-label]="
                        'Delete ' + instruction.data.name + ' instruction'
                      "
                      (click)="onDeleteInstruction(instruction.id)"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </mat-card>
                </mat-grid-tile>
              </mat-grid-list>

              <ng-template #emptyList>
                <p class="text-center text-xl">There's no instructions yet.</p>
              </ng-template>
            </section>
          </mat-tab>
          <mat-tab label="Context">Context</mat-tab>
          <mat-tab label="Account">
            <section *ngrxLet="attributes$; let attributes">
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
                      {{
                        attribute.data.kind.size * attribute.data.modifier.size
                      }}
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
                    <button
                      mat-mini-fab
                      color="warn"
                      [disabled]="(connected$ | ngrxPush) === false"
                      [attr.aria-label]="
                        'Delete ' + attribute.data.name + ' attribute'
                      "
                      (click)="onDeleteAttribute(attribute.id)"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </mat-card>
                </mat-grid-tile>
              </mat-grid-list>

              <ng-template #emptyList>
                <p class="text-center text-xl">There's no attributes yet.</p>
              </ng-template>
            </section>
          </mat-tab>
        </mat-tab-group>

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
          <button mat-menu-item (click)="onEditAttribute()">
            New attribute
          </button>
          <button mat-menu-item (click)="onEditInstruction()">
            New instruction
          </button>
          <button mat-menu-item (click)="onEditCollection(collection)">
            Edit collection
          </button>
          <button mat-menu-item (click)="onDeleteCollection(collection.id)">
            Delete collection
          </button>
        </mat-menu>
      </main>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CollectionStore],
})
export class CollectionComponent implements OnInit {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  readonly collection$ = this._collectionStore.collection$;
  readonly attributes$ = this._collectionStore.attributes$;
  readonly instructions$ = this._collectionStore.instructions$;
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
    private readonly _activeBreakpointService: ActiveBreakpointService,
    private readonly _collectionStore: CollectionStore
  ) {}

  ngOnInit() {
    this._collectionStore.state$.subscribe((a) => console.log(a));

    console.log(this._route);
  }

  onReload() {
    console.log('reload');
    this._collectionStore.reload();
  }

  onEditCollection(collection?: Collection) {
    this._collectionStore.openEditCollection(collection);
  }

  onDeleteCollection(collectionId: string) {
    this._collectionStore.deleteCollection(collectionId);
  }

  onEditAttribute(attribute?: CollectionAttribute) {
    this._collectionStore.openEditAttribute(attribute);
  }

  onDeleteAttribute(attributeId: string) {
    this._collectionStore.deleteAttribute(attributeId);
  }

  onEditInstruction(instruction?: CollectionInstruction) {
    this._collectionStore.openEditInstruction(instruction);
  }

  onDeleteInstruction(instructionId: string) {
    this._collectionStore.deleteInstruction(instructionId);
  }
}
