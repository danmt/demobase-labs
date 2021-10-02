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
    <mat-sidenav-container class="h-full" fullscreen>
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

            <mat-accordion displayMode="flat" togglePosition="before" multi>
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title class="m-0 items-center justify-around">
                    Collections
                    <button
                      mat-icon-button
                      [disabled]="(connected$ | ngrxPush) === false"
                      aria-label="Create collection"
                      (click)="onCreateCollection($event)"
                    >
                      <mat-icon>add</mat-icon>
                    </button>
                  </mat-panel-title>
                </mat-expansion-panel-header>
                <mat-nav-list dense>
                  <mat-list-item
                    *ngFor="let collection of collections$ | ngrxPush"
                  >
                    <a matLine [routerLink]="['/collections', collection.id]">
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
              </mat-expansion-panel>
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title class="m-0 items-center justify-around">
                    Instructions
                    <button
                      mat-icon-button
                      [disabled]="(connected$ | ngrxPush) === false"
                      aria-label="Create instruction"
                      (click)="onCreateInstruction($event)"
                    >
                      <mat-icon>add</mat-icon>
                    </button>
                  </mat-panel-title>
                </mat-expansion-panel-header>
                <mat-nav-list dense>
                  <mat-list-item
                    *ngFor="let instruction of instructions$ | ngrxPush"
                  >
                    <a matLine [routerLink]="['/instructions', instruction.id]">
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
              </mat-expansion-panel>
            </mat-accordion>
          </div>

          <mat-expansion-panel class="flex-shrink-0" togglePosition="before">
            <mat-expansion-panel-header>
              <mat-panel-title class="m-0 items-center justify-around">
                <ng-container
                  *ngIf="
                    application$ | ngrxPush as application;
                    else noApplicationSelected
                  "
                >
                  {{ application.data.name }}
                </ng-container>
                <ng-template #noApplicationSelected>Applications</ng-template>

                <button
                  mat-icon-button
                  [disabled]="(connected$ | ngrxPush) === false"
                  aria-label="Create application"
                  (click)="onCreateApplication($event)"
                >
                  <mat-icon>add</mat-icon>
                </button>
              </mat-panel-title>
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
                  (click)="onEditApplication(application)"
                  [disabled]="(connected$ | ngrxPush) === false"
                  [attr.aria-label]="
                    'Edit ' + application.data.name + ' application'
                  "
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-icon-button
                  (click)="onDeleteApplication(application.id)"
                  [disabled]="(connected$ | ngrxPush) === false"
                  [attr.aria-label]="
                    'Delete ' + application.data.name + ' application'
                  "
                >
                  <mat-icon>delete</mat-icon>
                </button>
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
