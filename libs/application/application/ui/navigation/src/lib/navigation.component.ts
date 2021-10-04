import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { ApplicationStore } from '@demobase-labs/application/application/data-access/application';
import { CollectionStore } from '@demobase-labs/application/application/data-access/collection';
import { InstructionStore } from '@demobase-labs/application/application/data-access/instruction';
import { ConnectWalletComponent } from '@demobase-labs/application/wallet/ui/connect-wallet';
import {
  Application,
  Collection,
  Instruction,
} from '@demobase-labs/demobase-sdk';
import { isNotNullOrUndefined } from '@demobase-labs/shared/utils/operators';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'demobase-labs-application-navigation',
  template: `
    <mat-sidenav-container
      class="h-full"
      fullscreen
      *ngrxLet="application$; let application"
    >
      <mat-sidenav
        #drawer
        fixedInViewport
        class="sidenav"
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false"
      >
        <div class="h-full flex flex-col">
          <div class="flex-grow overflow-auto">
            <figure class="mt-4 w-full flex justify-center">
              <img src="assets/images/logo.png" class="w-4/6" />
            </figure>
            <h2 class="mt-4 text-center">DEMOBASE</h2>

            <mat-accordion
              displayMode="flat"
              togglePosition="before"
              multi
              *ngIf="application"
            >
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <div class="flex justify-between items-center flex-grow">
                    <mat-panel-title> Collections </mat-panel-title>
                    <button
                      mat-icon-button
                      [disabled]="(connected$ | ngrxPush) === false"
                      aria-label="Create collection"
                      (click)="onCreateCollection($event)"
                    >
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>
                </mat-expansion-panel-header>
                <mat-nav-list dense>
                  <mat-list-item
                    *ngFor="let collection of collections$ | ngrxPush"
                  >
                    <a
                      matLine
                      [routerLink]="[
                        '/applications',
                        application.id,
                        'collections',
                        collection.id
                      ]"
                    >
                      {{ collection.data.name }}
                    </a>

                    <button
                      mat-icon-button
                      [attr.aria-label]="
                        'More options of ' +
                        collection.data.name +
                        ' collection'
                      "
                      [matMenuTriggerFor]="collectionOptionsMenu"
                    >
                      <mat-icon>more_horiz</mat-icon>
                    </button>
                    <mat-menu #collectionOptionsMenu="matMenu">
                      <button
                        mat-menu-item
                        (click)="onEditCollection(collection)"
                        [disabled]="(connected$ | ngrxPush) === false"
                      >
                        <mat-icon>edit</mat-icon>
                        <span>Edit collection</span>
                      </button>
                      <button
                        mat-menu-item
                        (click)="onDeleteCollection(collection.id)"
                        [disabled]="(connected$ | ngrxPush) === false"
                      >
                        <mat-icon>delete</mat-icon>
                        <span>Delete collection</span>
                      </button>
                    </mat-menu>
                  </mat-list-item>
                </mat-nav-list>
              </mat-expansion-panel>
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <div class="flex justify-between items-center flex-grow">
                    <mat-panel-title> Instructions </mat-panel-title>
                    <button
                      mat-icon-button
                      [disabled]="(connected$ | ngrxPush) === false"
                      aria-label="Create instruction"
                      (click)="onCreateInstruction($event)"
                    >
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>
                </mat-expansion-panel-header>
                <mat-nav-list dense>
                  <mat-list-item
                    *ngFor="let instruction of instructions$ | ngrxPush"
                  >
                    <a
                      matLine
                      [routerLink]="[
                        '/applications',
                        application.id,
                        'instructions',
                        instruction.id
                      ]"
                    >
                      {{ instruction.data.name }}
                    </a>

                    <button
                      mat-icon-button
                      [attr.aria-label]="
                        'More options of ' +
                        instruction.data.name +
                        ' instruction'
                      "
                      [matMenuTriggerFor]="instructionOptionsMenu"
                    >
                      <mat-icon>more_horiz</mat-icon>
                    </button>
                    <mat-menu #instructionOptionsMenu="matMenu">
                      <button
                        mat-menu-item
                        (click)="onEditInstruction(instruction)"
                        [disabled]="(connected$ | ngrxPush) === false"
                      >
                        <mat-icon>edit</mat-icon>
                        <span>Edit instruction</span>
                      </button>
                      <button
                        mat-menu-item
                        (click)="onDeleteInstruction(instruction.id)"
                        [disabled]="(connected$ | ngrxPush) === false"
                      >
                        <mat-icon>delete</mat-icon>
                        <span>Delete instruction</span>
                      </button>
                    </mat-menu>
                  </mat-list-item>
                </mat-nav-list>
              </mat-expansion-panel>
            </mat-accordion>
          </div>

          <mat-expansion-panel class="flex-shrink-0" togglePosition="before">
            <mat-expansion-panel-header>
              <div class="flex justify-between items-center flex-grow">
                <mat-panel-title>
                  <ng-container *ngIf="application; else noApplicationSelected">
                    {{ application.data.name }}
                  </ng-container>
                  <ng-template #noApplicationSelected>Applications</ng-template>
                </mat-panel-title>
                <button
                  mat-icon-button
                  [disabled]="(connected$ | ngrxPush) === false"
                  aria-label="Create application"
                  (click)="onCreateApplication($event)"
                >
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </mat-expansion-panel-header>
            <mat-nav-list dense>
              <mat-list-item
                *ngFor="let application of applications$ | ngrxPush"
              >
                <a matLine [routerLink]="['/applications', application.id]">
                  {{ application.data.name }}
                </a>

                <button
                  mat-icon-button
                  [attr.aria-label]="
                    'More options of ' + application.data.name + ' application'
                  "
                  [matMenuTriggerFor]="applicationOptionsMenu"
                >
                  <mat-icon>more_horiz</mat-icon>
                </button>
                <mat-menu #applicationOptionsMenu="matMenu">
                  <button
                    mat-menu-item
                    (click)="onEditApplication(application)"
                    [disabled]="(connected$ | ngrxPush) === false"
                  >
                    <mat-icon>edit</mat-icon>
                    <span>Edit application</span>
                  </button>
                  <button
                    mat-menu-item
                    (click)="onDeleteApplication(application.id)"
                    [disabled]="(connected$ | ngrxPush) === false"
                  >
                    <mat-icon>delete</mat-icon>
                    <span>Delete application</span>
                  </button>
                </mat-menu>
              </mat-list-item>
            </mat-nav-list>
          </mat-expansion-panel>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async"
          >
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>

          <ng-container *ngrxLet="connected$; let connected">
            <div *ngIf="!connected" class="ml-auto">
              <button mat-raised-button color="accent" (click)="onConnect()">
                Connect
              </button>
            </div>

            <div *ngIf="connected" class="ml-auto flex items-center">
              <ng-container *ngIf="address$ | ngrxPush as address">
                {{ address | obscureAddress }}
              </ng-container>
              <button
                mat-raised-button
                color="warn"
                class="ml-4"
                (click)="onDisconnect()"
              >
                Disconnect
              </button>
            </div>
          </ng-container>
        </mat-toolbar>
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav {
        width: 200px;
      }

      .sidenav .mat-toolbar {
        background: inherit;
      }

      .mat-toolbar.mat-primary {
        position: sticky;
        top: 0;
        z-index: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
  readonly connected$ = this._walletStore.connected$;
  readonly address$ = this._walletStore.publicKey$.pipe(
    isNotNullOrUndefined,
    map((publicKey) => publicKey.toBase58())
  );
  readonly isHandset$: Observable<boolean> = this._breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  readonly applications$ = this._applicationStore.applications$;
  readonly application$ = this._applicationStore.application$;
  readonly collections$ = this._collectionStore.collections$;
  readonly instructions$ = this._instructionStore.instructions$;

  constructor(
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _walletStore: WalletStore,
    private readonly _matDialog: MatDialog,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionStore: InstructionStore
  ) {}

  onConnect() {
    this._matDialog.open(ConnectWalletComponent);
  }

  onDisconnect() {
    if (confirm('Are you sure?')) {
      this._walletStore.disconnect().subscribe();
    }
  }

  onCreateApplication(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this._applicationStore.createApplication();
  }

  onEditApplication(application: Application) {
    this._applicationStore.updateApplication(application);
  }

  onDeleteApplication(applicationId: string) {
    this._applicationStore.deleteApplication(applicationId);
  }

  onCreateCollection(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this._collectionStore.createCollection();
  }

  onEditCollection(collection: Collection) {
    this._collectionStore.updateCollection(collection);
  }

  onDeleteCollection(collectionId: string) {
    this._collectionStore.deleteCollection(collectionId);
  }

  onCreateInstruction(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this._instructionStore.createInstruction();
  }

  onEditInstruction(instruction: Instruction) {
    this._instructionStore.updateInstruction(instruction);
  }

  onDeleteInstruction(instructionId: string) {
    this._instructionStore.deleteInstruction(instructionId);
  }
}
