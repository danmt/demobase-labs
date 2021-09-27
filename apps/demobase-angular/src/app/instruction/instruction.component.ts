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
  CollectionInstruction,
  DemobaseService,
  InstructionAccount,
  InstructionArgument,
} from '@demobase-labs/demobase-sdk';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActiveBreakpointService } from '../core/services/active-breakpoint.service';
import { CreateAccountComponent } from './create-account.component';
import { CreateArgumentComponent } from './create-argument.component';

@Component({
  selector: 'demobase-instruction',
  template: `
    <ng-container *ngIf="instruction$ | ngrxPush as instruction">
      <header demobasePageHeader>
        <h1>
          {{ instruction.data.name }}
          <button
            mat-icon-button
            color="primary"
            aria-label="Reload collection"
            (click)="onReload()"
          >
            <mat-icon>refresh</mat-icon>
          </button>
        </h1>
        <p>Visualize all the details about this instruction.</p>
      </header>

      <main>
        <section *ngrxLet="arguments$; let arguments">
          <h2>Arguments</h2>

          <mat-grid-list
            *ngIf="arguments.length > 0; else emptyList"
            [cols]="gridCols$ | ngrxPush"
            rowHeight="10rem"
            gutterSize="16"
          >
            <mat-grid-tile
              *ngFor="let argument of arguments"
              [colspan]="1"
              [rowspan]="1"
              class="overflow-visible"
            >
              <mat-card class="w-full h-full">
                <h3>Name: {{ argument.data.name }}.</h3>
                <p>Kind: {{ argument.data.kind }}.</p>
                <p>
                  Modifier: {{ argument.data.modifier.name }} ({{
                    argument.data.modifier.size
                  }}).
                </p>
              </mat-card>
            </mat-grid-tile>
          </mat-grid-list>

          <ng-template #emptyList>
            <p class="text-center text-xl">There's no arguments yet.</p>
          </ng-template>
        </section>

        <section *ngrxLet="accounts$; let accounts">
          <h2>Accounts</h2>

          <mat-grid-list
            *ngIf="accounts.length > 0; else emptyList"
            [cols]="gridCols$ | ngrxPush"
            rowHeight="10rem"
            gutterSize="16"
          >
            <mat-grid-tile
              *ngFor="let account of accounts"
              [colspan]="1"
              [rowspan]="1"
              class="overflow-visible"
            >
              <mat-card class="w-full h-full">
                <h3>Name: {{ account.data.name }}</h3>
                <p>Kind: {{ account.data.kind }}</p>
                <p>Mark attribute: {{ account.data.markAttribute }}</p>
                <p>
                  Collection:
                  {{ account.data.collection | obscureAddress }}
                  <a
                    [routerLink]="[
                      '/collections',
                      account.data.application,
                      account.data.collection
                    ]"
                    >view</a
                  >
                </p>
              </mat-card>
            </mat-grid-tile>
          </mat-grid-list>

          <ng-template #emptyList>
            <p class="text-center text-xl">There's no accounts yet.</p>
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
          <button mat-menu-item (click)="onCreateInstructionAccount()">
            Create account
          </button>
          <button mat-menu-item (click)="onCreateInstructionArgument()">
            Create argument
          </button>
        </mat-menu>
      </main>
    </ng-container>
  `,
  styles: [
    `
      .selected {
        border: 2px solid red;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructionComponent implements OnInit {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  private readonly _instruction =
    new BehaviorSubject<CollectionInstruction | null>(null);
  readonly instruction$ = this._instruction.asObservable();
  private readonly _arguments = new BehaviorSubject<InstructionArgument[]>([]);
  readonly arguments$ = this._arguments.asObservable();
  private readonly _accounts = new BehaviorSubject<InstructionAccount[]>([]);
  readonly accounts$ = this._accounts.asObservable();
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
    this._getInstruction();
    this._getArguments();
    this._getAccounts();
  }

  private async _getInstruction() {
    const instructionId = this._route.snapshot.paramMap.get('instructionId');

    if (instructionId) {
      try {
        const instruction =
          await this._demobaseService.getCollectionInstruction(instructionId);
        this._instruction.next(instruction);
      } catch (error) {
        console.error(error);
      }
    }
  }

  private async _getArguments() {
    const instructionId = this._route.snapshot.paramMap.get('instructionId');

    if (instructionId) {
      try {
        const instructionArguments =
          await this._demobaseService.getCollectionInstructionArguments(
            instructionId
          );
        this._arguments.next(instructionArguments);
      } catch (error) {
        console.error(error);
      }
    }
  }

  private async _getAccounts() {
    const instructionId = this._route.snapshot.paramMap.get('instructionId');

    if (instructionId) {
      try {
        const accounts =
          await this._demobaseService.getCollectionInstructionAccounts(
            instructionId
          );
        this._accounts.next(accounts);
      } catch (error) {
        console.error(error);
      }
    }
  }

  onReload() {
    this._getInstruction();
    this._getArguments();
    this._getAccounts();
  }

  onCreateInstructionArgument() {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');
    const collectionId = this._route.snapshot.paramMap.get('collectionId');
    const instructionId = this._route.snapshot.paramMap.get('instructionId');

    if (applicationId && collectionId && instructionId) {
      this._matDialog.open(CreateArgumentComponent, {
        data: { applicationId, collectionId, instructionId },
      });
    }
  }

  onCreateInstructionAccount() {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');
    const collectionId = this._route.snapshot.paramMap.get('collectionId');
    const instructionId = this._route.snapshot.paramMap.get('instructionId');

    if (applicationId && collectionId && instructionId) {
      this._matDialog.open(CreateAccountComponent, {
        data: { applicationId, collectionId, instructionId },
      });
    }
  }
}
