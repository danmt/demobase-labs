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
  AccountBoolAttribute,
  AccountBoolAttributeKind,
  CollectionInstruction,
  DemobaseService,
  InstructionAccount,
  InstructionArgument,
} from '@demobase-labs/demobase-sdk';
import { BehaviorSubject } from 'rxjs';

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
        <section>
          <h2>Arguments</h2>

          <ul *ngrxLet="arguments$; let arguments">
            <li *ngFor="let argument of arguments">
              <h4>Name: {{ argument.data.name }}.</h4>
              <p>Kind: {{ argument.data.kind }}.</p>
              <p>
                Modifier: {{ argument.data.modifier.name }} ({{
                  argument.data.modifier.size
                }}).
              </p>
            </li>
          </ul>
        </section>

        <section>
          <h2>Accounts</h2>

          <ng-container *ngrxLet="accounts$; let accounts">
            <ul *ngrxLet="boolAttributes$; let boolAttributes">
              <li *ngFor="let account of accounts">
                <h4>Name: {{ account.data.name }}</h4>
                <p>Kind: {{ account.data.kind }}</p>
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

                <div>
                  Bool Attribute:
                  <button
                    (click)="
                      onSetBoolAttribute(instruction.id, account.id, null, null)
                    "
                    [ngClass]="{
                      selected: !boolAttributes.has(account.id)
                    }"
                  >
                    None
                  </button>
                  <button
                    (click)="
                      onSetBoolAttribute(
                        instruction.id,
                        account.id,
                        boolAttributes.get(account.id)?.id || null,
                        0
                      )
                    "
                    [ngClass]="{
                      selected:
                        boolAttributes.get(account.id)?.data?.kind === 'init'
                    }"
                  >
                    Init
                  </button>
                  <button
                    (click)="
                      onSetBoolAttribute(
                        instruction.id,
                        account.id,
                        boolAttributes.get(account.id)?.id || null,
                        1
                      )
                    "
                    [ngClass]="{
                      selected:
                        boolAttributes.get(account.id)?.data?.kind === 'mut'
                    }"
                  >
                    Mut
                  </button>
                  <button
                    (click)="
                      onSetBoolAttribute(
                        instruction.id,
                        account.id,
                        boolAttributes.get(account.id)?.id || null,
                        2
                      )
                    "
                    [ngClass]="{
                      selected:
                        boolAttributes.get(account.id)?.data?.kind === 'zero'
                    }"
                  >
                    Zero
                  </button>
                </div>
              </li>
            </ul>
          </ng-container>
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
  private readonly _boolAttributes = new BehaviorSubject<
    Map<string, AccountBoolAttribute>
  >(new Map<string, AccountBoolAttribute>());
  readonly boolAttributes$ = this._boolAttributes.asObservable();

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _walletStore: WalletStore,
    private readonly _demobaseService: DemobaseService,
    private readonly _matDialog: MatDialog
  ) {}

  ngOnInit() {
    this._getInstruction();
    this._getArguments();
    this._getAccounts();
    this._getBoolAttributes();
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

  private async _getBoolAttributes() {
    const instructionId = this._route.snapshot.paramMap.get('instructionId');

    if (instructionId) {
      try {
        const boolAttributes =
          await this._demobaseService.getCollectionInstructionBoolAttributes(
            instructionId
          );
        this._boolAttributes.next(
          new Map(
            boolAttributes.map((boolAttribute) => [
              boolAttribute.id,
              boolAttribute,
            ])
          )
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  onReload() {
    this._getInstruction();
    this._getArguments();
    this._getAccounts();
    this._getBoolAttributes();
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

  onSetBoolAttribute(
    instructionId: string,
    accountId: string,
    boolAttributeId: string | null,
    kind: AccountBoolAttributeKind | null
  ) {
    const applicationId = this._route.snapshot.paramMap.get('applicationId');
    const collectionId = this._route.snapshot.paramMap.get('collectionId');

    if (applicationId && collectionId) {
      if (boolAttributeId === null) {
        if (kind !== null) {
          this._demobaseService.createCollectionInstructionAccountBoolAttribute(
            applicationId,
            collectionId,
            instructionId,
            accountId,
            kind
          );
        }
      } else {
        if (kind === null) {
          this._demobaseService.deleteCollectionInstructionAccountBoolAttribute(
            boolAttributeId
          );
        } else {
          this._demobaseService.updateCollectionInstructionAccountBoolAttribute(
            boolAttributeId,
            kind
          );
        }
      }
    }
  }
}
