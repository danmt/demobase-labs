import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationStore } from '@demobase-labs/application/application/data-access/application';
import { CollectionStore } from '@demobase-labs/application/application/data-access/collection';
import { EditArgumentComponent } from '@demobase-labs/application/application/ui/edit-argument';
import { EditBasicAccountComponent } from '@demobase-labs/application/application/ui/edit-basic-account';
import { EditInstructionComponent } from '@demobase-labs/application/application/ui/edit-instruction';
import { EditProgramAccountComponent } from '@demobase-labs/application/application/ui/edit-program-account';
import { EditSignerAccountComponent } from '@demobase-labs/application/application/ui/edit-signer-account';
import {
  Instruction,
  InstructionArgument,
  InstructionBasicAccount,
  InstructionProgramAccount,
  InstructionSignerAccount,
} from '@demobase-labs/demobase-sdk';
import { ProgramStore } from '@demobase-labs/shared/data-access/program';
import { isNotNullOrUndefined } from '@demobase-labs/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { SystemProgram } from '@solana/web3.js';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import {
  concatMap,
  exhaustMap,
  filter,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

interface ViewModel {
  instructionId: string | null;
  instructions: Instruction[];
  arguments: InstructionArgument[];
  basicAccounts: InstructionBasicAccount[];
  signerAccounts: InstructionSignerAccount[];
  programAccounts: InstructionProgramAccount[];
}

const initialState: ViewModel = {
  instructionId: null,
  instructions: [],
  arguments: [],
  basicAccounts: [],
  signerAccounts: [],
  programAccounts: [],
};

@Injectable()
export class InstructionStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  readonly instructions$ = this.select(({ instructions }) => instructions);
  readonly arguments$ = this.select(
    ({ arguments: instructionArguments }) => instructionArguments
  );
  readonly basicAccounts$ = this.select(({ basicAccounts }) => basicAccounts);
  readonly signerAccounts$ = this.select(
    ({ signerAccounts }) => signerAccounts
  );
  readonly programAccounts$ = this.select(
    ({ programAccounts }) => programAccounts
  );
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);

  constructor(
    private readonly _programStore: ProgramStore,
    private readonly _matDialog: MatDialog,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore
  ) {
    super(initialState);
  }

  readonly loadInstructions = this.effect(() =>
    combineLatest([
      this.reload$,
      this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
    ]).pipe(
      switchMap(([, applicationId]) =>
        this._programStore.getInstructions(applicationId).pipe(
          tapResponse(
            (instructions) => this.patchState({ instructions }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadArguments = this.effect(() =>
    combineLatest([
      this.instructionId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([instructionId]) =>
        this._programStore.getInstructionArguments(instructionId).pipe(
          tapResponse(
            (instructionArguments) =>
              this.patchState({ arguments: instructionArguments }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadBasicAccounts = this.effect(() =>
    combineLatest([
      this.instructionId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([instructionId]) =>
        this._programStore.getInstructionBasicAccounts(instructionId).pipe(
          tapResponse(
            (basicAccounts) => this.patchState({ basicAccounts }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadSignerAccounts = this.effect(() =>
    combineLatest([
      this.instructionId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([instructionId]) =>
        this._programStore.getInstructionSignerAccounts(instructionId).pipe(
          tapResponse(
            (signerAccounts) => this.patchState({ signerAccounts }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadProgramAccounts = this.effect(() =>
    combineLatest([
      this.instructionId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([instructionId]) =>
        this._programStore.getInstructionProgramAccounts(instructionId).pipe(
          tapResponse(
            (programAccounts) => this.patchState({ programAccounts }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly selectInstruction = this.effect(
    (instructionId$: Observable<string | null>) =>
      instructionId$.pipe(
        tap((instructionId) => this.patchState({ instructionId }))
      )
  );

  readonly createInstruction = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditInstructionComponent)
          .afterClosed()
          .pipe(
            withLatestFrom(
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ name }, applicationId]) =>
              this._programStore.createInstruction(applicationId, name)
            )
          )
      ),

      tap(() => this._reload.next(null))
    )
  );

  readonly updateInstruction = this.effect(
    (instruction$: Observable<Instruction>) =>
      instruction$.pipe(
        exhaustMap((instruction) =>
          this._matDialog
            .open(EditInstructionComponent, { data: { instruction } })
            .afterClosed()
            .pipe(
              concatMap(({ name }) =>
                this._programStore.updateInstruction(instruction.id, name)
              )
            )
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly deleteInstruction = this.effect(
    (instructionId$: Observable<string>) =>
      instructionId$.pipe(
        concatMap((instructionId) =>
          this._programStore.deleteInstruction(instructionId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly createInstructionArgument = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditArgumentComponent)
          .afterClosed()
          .pipe(
            withLatestFrom(
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
              this.instructionId$.pipe(isNotNullOrUndefined)
            ),

            filter(([data]) => data),
            concatMap(
              ([
                { name, kind, modifier, size },
                applicationId,
                instructionId,
              ]) =>
                this._programStore.createInstructionArgument(
                  applicationId,
                  instructionId,
                  name,
                  kind,
                  modifier,
                  size
                )
            )
          )
      ),
      tap(() => this._reload.next(null))
    )
  );

  readonly updateInstructionArgument = this.effect(
    (argument$: Observable<InstructionArgument>) =>
      argument$.pipe(
        exhaustMap((argument) =>
          this._matDialog
            .open(EditArgumentComponent, {
              data: { argument },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, kind, modifier, size }) =>
                this._programStore.updateInstructionArgument(
                  argument.id,
                  name,
                  kind,
                  modifier,
                  size
                )
              )
            )
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly deleteInstructionArgument = this.effect(
    (argumentId$: Observable<string>) =>
      argumentId$.pipe(
        concatMap((argumentId) =>
          this._programStore.deleteInstructionArgument(argumentId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly createInstructionBasicAccount = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(
            this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
            this.instructionId$.pipe(isNotNullOrUndefined),
            this._collectionStore.collections$
          )
        )
      ),
      exhaustMap(([, applicationId, instructionId, collections]) =>
        this._matDialog
          .open(EditBasicAccountComponent, { data: { collections } })
          .afterClosed()
          .pipe(
            concatMap(({ name, markAttribute, collection }) =>
              this._programStore.createInstructionBasicAccount(
                applicationId,
                instructionId,
                name,
                collection,
                markAttribute
              )
            )
          )
      ),
      tap(() => this._reload.next(null))
    )
  );

  readonly updateInstructionBasicAccount = this.effect(
    (account$: Observable<InstructionBasicAccount>) =>
      account$.pipe(
        concatMap((account) =>
          of(account).pipe(withLatestFrom(this._collectionStore.collections$))
        ),
        exhaustMap(([account, collections]) =>
          this._matDialog
            .open(EditBasicAccountComponent, {
              data: { account, collections },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, markAttribute, collection }) =>
                this._programStore.updateInstructionBasicAccount(
                  account.id,
                  name,
                  collection,
                  markAttribute
                )
              )
            )
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly deleteInstructionBasicAccount = this.effect(
    (accountId$: Observable<string>) =>
      accountId$.pipe(
        concatMap((accountId) =>
          this._programStore.deleteInstructionBasicAccount(accountId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly createInstructionSignerAccount = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(
            this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
            this.instructionId$.pipe(isNotNullOrUndefined)
          )
        )
      ),
      exhaustMap(([, applicationId, instructionId]) =>
        this._matDialog
          .open(EditSignerAccountComponent)
          .afterClosed()
          .pipe(
            concatMap(({ name, markAttribute }) =>
              this._programStore.createInstructionSignerAccount(
                applicationId,
                instructionId,
                name,
                markAttribute
              )
            )
          )
      ),
      tap(() => this._reload.next(null))
    )
  );

  readonly updateInstructionSignerAccount = this.effect(
    (account$: Observable<InstructionSignerAccount>) =>
      account$.pipe(
        exhaustMap((account) =>
          this._matDialog
            .open(EditSignerAccountComponent, {
              data: { account },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, markAttribute }) =>
                this._programStore.updateInstructionSignerAccount(
                  account.id,
                  name,
                  markAttribute
                )
              )
            )
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly deleteInstructionSignerAccount = this.effect(
    (accountId$: Observable<string>) =>
      accountId$.pipe(
        concatMap((accountId) =>
          this._programStore.deleteInstructionSignerAccount(accountId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly createInstructionProgramAccount = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(
            this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
            this.instructionId$.pipe(isNotNullOrUndefined)
          )
        )
      ),
      exhaustMap(([, applicationId, instructionId]) =>
        this._matDialog
          .open(EditProgramAccountComponent, {
            data: {
              programs: [
                {
                  id: SystemProgram.programId.toBase58(),
                  name: 'System program',
                },
              ],
            },
          })
          .afterClosed()
          .pipe(
            concatMap(({ name, program }) =>
              this._programStore.createInstructionProgramAccount(
                applicationId,
                instructionId,
                name,
                program
              )
            )
          )
      ),
      tap(() => this._reload.next(null))
    )
  );

  readonly updateInstructionProgramAccount = this.effect(
    (account$: Observable<InstructionProgramAccount>) =>
      account$.pipe(
        exhaustMap((account) =>
          this._matDialog
            .open(EditProgramAccountComponent, {
              data: {
                account,
                programs: [
                  {
                    id: SystemProgram.programId.toBase58(),
                    name: 'System program',
                  },
                ],
              },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, program }) =>
                this._programStore.updateInstructionProgramAccount(
                  account.id,
                  name,
                  program
                )
              )
            )
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly deleteInstructionProgramAccount = this.effect(
    (accountId$: Observable<string>) =>
      accountId$.pipe(
        concatMap((accountId) =>
          this._programStore.deleteInstructionProgramAccount(accountId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  reload() {
    this._reload.next(null);
  }
}
