import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { Collection, Instruction } from '@demobase-labs/demobase-sdk';
import { map, shareReplay } from 'rxjs/operators';

import { ActiveBreakpointService } from '../core/services/active-breakpoint.service';
import { ApplicationStore } from './application.store';

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
        <mat-sidenav-container class="sidenav-container" fullscreen>
          <mat-sidenav
            #drawer
            class="sidenav"
            [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
            [mode]="(isHandset$ | async) ? 'over' : 'side'"
            [opened]="(isHandset$ | async) === false"
          >
            <ng-container *ngrxLet="collections$; let collections">
              <h2 class="mt-4 text-center">
                Collections
                <button
                  mat-icon-button
                  (click)="onCreateCollection()"
                  [disabled]="(connected$ | ngrxPush) === false"
                  aria-label="Create collection"
                >
                  <mat-icon>add</mat-icon>
                </button>
              </h2>
              <mat-nav-list *ngIf="collections.length > 0">
                <mat-list-item *ngFor="let collection of collections">
                  <a matLine [routerLink]="['collections', collection.id]">
                    {{ collection.data.name }}
                  </a>

                  <button
                    mat-icon-button
                    (click)="onEditCollection(collection)"
                    [disabled]="(connected$ | ngrxPush) === false"
                    [attr.aria-label]="
                      'Edit ' + collection.data.name + ' collection'
                    "
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    (click)="onDeleteCollection(collection.id)"
                    [disabled]="(connected$ | ngrxPush) === false"
                    [attr.aria-label]="
                      'Delete ' + collection.data.name + ' collection'
                    "
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </mat-list-item>
              </mat-nav-list>
            </ng-container>
            <ng-container *ngrxLet="instructions$; let instructions">
              <h2 class="mt-4 text-center">
                Instructions
                <button
                  mat-icon-button
                  (click)="onCreateInstruction()"
                  [disabled]="(connected$ | ngrxPush) === false"
                  aria-label="Create instruction"
                >
                  <mat-icon>add</mat-icon>
                </button>
              </h2>
              <mat-nav-list *ngIf="instructions.length > 0">
                <mat-list-item *ngFor="let instruction of instructions">
                  <a matLine [routerLink]="['instructions', instruction.id]">
                    {{ instruction.data.name }}
                  </a>

                  <button
                    mat-icon-button
                    (click)="onEditInstruction(instruction)"
                    [disabled]="(connected$ | ngrxPush) === false"
                    [attr.aria-label]="
                      'Edit ' + instruction.data.name + ' instruction'
                    "
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    (click)="onDeleteInstruction(instruction.id)"
                    [disabled]="(connected$ | ngrxPush) === false"
                    [attr.aria-label]="
                      'Delete ' + instruction.data.name + ' instruction'
                    "
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </mat-list-item>
              </mat-nav-list>
            </ng-container>
          </mat-sidenav>
          <mat-sidenav-content>
            <router-outlet></router-outlet>
          </mat-sidenav-content>
        </mat-sidenav-container>
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
  providers: [ApplicationStore],
})
export class ApplicationComponent {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  readonly application$ = this._applicationStore.application$;
  readonly collections$ = this._applicationStore.collections$;
  readonly instructions$ = this._applicationStore.instructions$;
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
    private readonly _walletStore: WalletStore,
    private readonly _activeBreakpointService: ActiveBreakpointService,
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _applicationStore: ApplicationStore
  ) {}

  onReload() {
    this._applicationStore.reload();
  }

  onCreateCollection() {
    this._applicationStore.createCollection(
      this._applicationStore.applicationId$
    );
  }

  onEditCollection(collection: Collection) {
    this._applicationStore.updateCollection(collection);
  }

  onDeleteCollection(collectionId: string) {
    this._applicationStore.deleteCollection(collectionId);
  }

  onCreateInstruction() {
    this._applicationStore.createInstruction(
      this._applicationStore.applicationId$
    );
  }

  onEditInstruction(instruction: Instruction) {
    this._applicationStore.updateInstruction(instruction);
  }

  onDeleteInstruction(instructionId: string) {
    this._applicationStore.deleteInstruction(instructionId);
  }
}
