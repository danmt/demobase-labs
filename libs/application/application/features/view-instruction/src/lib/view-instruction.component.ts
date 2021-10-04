import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { InstructionStore } from '@demobase-labs/application/application/data-access/instruction';
import { TabsStore } from '@demobase-labs/application/application/data-access/tabs';
import { ActiveBreakpointService } from '@demobase-labs/application/application/utils/services/active-breakpoint';
import {
  InstructionAccount,
  InstructionArgument,
} from '@demobase-labs/demobase-sdk';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'demobase-labs-view-instruction',
  template: `
    <ng-container *ngIf="instruction$ | ngrxPush as instruction">
      <header demobaseLabsPageHeader>
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
          <h2 class="flex items-center">
            Arguments
            <button
              mat-icon-button
              (click)="onCreateInstructionArgument()"
              [disabled]="(connected$ | ngrxPush) === false"
              aria-label="Create instruction argument"
            >
              <mat-icon>add</mat-icon>
            </button>
          </h2>

          <mat-grid-list
            *ngIf="arguments.length > 0; else emptyList"
            [cols]="gridCols$ | ngrxPush"
            rowHeight="11rem"
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
                <p>Kind: {{ argument.data.kind.name }}.</p>
                <p>
                  Modifier: {{ argument.data.modifier.name }} ({{
                    argument.data.modifier.size
                  }}).
                </p>
                <button
                  mat-mini-fab
                  color="primary"
                  [attr.aria-label]="'Edit ' + argument.data.name + ' argument'"
                  [disabled]="(connected$ | ngrxPush) === false"
                  (click)="onEditInstructionArgument(argument)"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-mini-fab
                  color="warn"
                  [attr.aria-label]="
                    'Delete ' + argument.data.name + ' argument'
                  "
                  [disabled]="(connected$ | ngrxPush) === false"
                  (click)="onDeleteInstructionArgument(argument.id)"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card>
            </mat-grid-tile>
          </mat-grid-list>

          <ng-template #emptyList>
            <p class="text-center text-xl">There's no arguments yet.</p>
          </ng-template>
        </section>

        <section *ngrxLet="accounts$; let accounts">
          <h2 class="flex items-center">
            Accounts
            <button
              mat-icon-button
              (click)="onCreateInstructionAccount()"
              [disabled]="(connected$ | ngrxPush) === false"
              aria-label="Create instruction account"
            >
              <mat-icon>add</mat-icon>
            </button>
          </h2>

          <mat-grid-list
            *ngIf="accounts.length > 0; else emptyList"
            [cols]="gridCols$ | ngrxPush"
            rowHeight="14rem"
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
                <p>Kind: {{ account.data.kind.name }}</p>
                <p>Mark argument: {{ account.data.markAttribute.name }}</p>
                <p>
                  Collection:
                  {{ account.data.collection | obscureAddress }}
                  <a
                    [routerLink]="[
                      '/applications',
                      account.data.application,
                      'collections',
                      account.data.collection
                    ]"
                    >view</a
                  >
                </p>
                <button
                  mat-mini-fab
                  color="primary"
                  [attr.aria-label]="'Edit ' + account.data.name + ' account'"
                  [disabled]="(connected$ | ngrxPush) === false"
                  (click)="onEditInstructionAccount(account)"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-mini-fab
                  color="warn"
                  [attr.aria-label]="'Delete ' + account.data.name + ' account'"
                  [disabled]="(connected$ | ngrxPush) === false"
                  (click)="onDeleteInstructionAccount(account.id)"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card>
            </mat-grid-tile>
          </mat-grid-list>

          <ng-template #emptyList>
            <p class="text-center text-xl">There's no accounts yet.</p>
          </ng-template>
        </section>
      </main>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewInstructionComponent implements OnInit {
  @HostBinding('class') class = 'block p-4';
  readonly connected$ = this._walletStore.connected$;
  readonly instruction$ = this._tabsStore.tab$;
  readonly arguments$ = this._instructionStore.arguments$;
  readonly accounts$ = this._instructionStore.accounts$;
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
    private readonly _tabsStore: TabsStore,
    private readonly _walletStore: WalletStore,
    private readonly _activeBreakpointService: ActiveBreakpointService,
    private readonly _instructionStore: InstructionStore
  ) {}

  ngOnInit() {
    this._instructionStore.selectInstruction(
      this._route.paramMap.pipe(
        filter((paramMap) => paramMap.has('instructionId')),
        map((paramMap) => paramMap.get('instructionId') as string)
      )
    );
  }

  onReload() {
    this._instructionStore.reload();
  }

  onCreateInstructionArgument() {
    this._instructionStore.createInstructionArgument();
  }

  onEditInstructionArgument(argument: InstructionArgument) {
    this._instructionStore.updateInstructionArgument(argument);
  }

  onDeleteInstructionArgument(argumentId: string) {
    this._instructionStore.deleteInstructionArgument(argumentId);
  }

  onCreateInstructionAccount() {
    this._instructionStore.createInstructionAccount();
  }

  onEditInstructionAccount(account: InstructionAccount) {
    this._instructionStore.updateInstructionAccount(account);
  }

  onDeleteInstructionAccount(accountId: string) {
    this._instructionStore.deleteInstructionAccount(accountId);
  }
}
