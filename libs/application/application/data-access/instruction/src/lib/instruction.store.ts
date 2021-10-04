import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationStore } from '@demobase-labs/application/application/data-access/application';
import { CollectionStore } from '@demobase-labs/application/application/data-access/collection';
import { EditAccountComponent } from '@demobase-labs/application/application/ui/edit-account';
import { EditArgumentComponent } from '@demobase-labs/application/application/ui/edit-argument';
import { EditInstructionComponent } from '@demobase-labs/application/application/ui/edit-instruction';
import {
  Instruction,
  InstructionAccount,
  InstructionArgument,
} from '@demobase-labs/demobase-sdk';
import { ProgramStore } from '@demobase-labs/shared/data-access/program';
import { isNotNullOrUndefined } from '@demobase-labs/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
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
  accounts: InstructionAccount[];
}

const initialState: ViewModel = {
  instructionId: null,
  instructions: [],
  arguments: [],
  accounts: [],
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
  readonly accounts$ = this.select(({ accounts }) => accounts);
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

  readonly loadAccounts = this.effect(() =>
    combineLatest([
      this.instructionId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([instructionId]) =>
        this._programStore.getInstructionAccounts(instructionId).pipe(
          tapResponse(
            (accounts) => this.patchState({ accounts }),
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

  readonly deleteInstruction = this.effect(
    (instructionId$: Observable<string>) =>
      instructionId$.pipe(
        concatMap((instructionId) =>
          this._programStore.deleteInstruction(instructionId)
        ),
        tap(() => this._reload.next(null))
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

  readonly deleteInstructionArgument = this.effect(
    (argumentId$: Observable<string>) =>
      argumentId$.pipe(
        concatMap((argumentId) =>
          this._programStore.deleteInstructionArgument(argumentId)
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

  readonly deleteInstructionAccount = this.effect(
    (accountId$: Observable<string>) =>
      accountId$.pipe(
        concatMap((accountId) =>
          this._programStore.deleteInstructionAccount(accountId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly createInstructionAccount = this.effect((action$) =>
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
      tap((a) => console.log(a)),
      exhaustMap(([, applicationId, instructionId, collections]) =>
        this._matDialog
          .open(EditAccountComponent, { data: { collections } })
          .afterClosed()
          .pipe(
            concatMap(({ name, kind, markAttribute, collection }) =>
              this._programStore.createInstructionAccount(
                applicationId,
                instructionId,
                collection,
                name,
                kind,
                markAttribute
              )
            )
          )
      ),
      tap(() => this._reload.next(null))
    )
  );

  readonly updateInstructionAccount = this.effect(
    (account$: Observable<InstructionAccount>) =>
      account$.pipe(
        concatMap((account) =>
          of(account).pipe(withLatestFrom(this._collectionStore.collections$))
        ),
        exhaustMap(([account, collections]) =>
          this._matDialog
            .open(EditAccountComponent, {
              data: { account, collections },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, kind, markAttribute, collection }) =>
                this._programStore.updateInstructionAccount(
                  account.id,
                  collection,
                  name,
                  kind,
                  markAttribute
                )
              )
            )
        ),
        tap(() => this._reload.next(null))
      )
  );

  reload() {
    this._reload.next(null);
  }
}
