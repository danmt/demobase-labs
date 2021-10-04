import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DemobaseService,
  Instruction,
  InstructionAccount,
  InstructionArgument,
} from '@demobase-labs/demobase-sdk';
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

import { DemobaseStore } from '../core/stores/demobase.store';
import { EditAccountComponent } from '../shared/components/edit-account.component';
import { EditArgumentComponent } from '../shared/components/edit-argument.component';

interface ViewModel {
  instruction: Instruction | null;
  arguments: InstructionArgument[];
  accounts: InstructionAccount[];
}

const initialState: ViewModel = {
  instruction: null,
  arguments: [],
  accounts: [],
};

@Injectable()
export class InstructionStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  readonly applicationId$ = this.select(
    this._route.paramMap.pipe(
      filter((paramMap) => paramMap.has('applicationId'))
    ),
    (paramMap) => paramMap.get('applicationId') as string
  );
  readonly instructionId$ = this.select(
    this._route.paramMap.pipe(
      filter((paramMap) => paramMap.has('instructionId'))
    ),
    (paramMap) => paramMap.get('instructionId') as string
  );
  readonly instruction$ = this.select(({ instruction }) => instruction);
  readonly arguments$ = this.select(
    ({ arguments: instructionArguments }) => instructionArguments
  );
  readonly accounts$ = this.select(({ accounts }) => accounts);

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _demobaseService: DemobaseService,
    private readonly _demobaseStore: DemobaseStore,
    private readonly _matDialog: MatDialog
  ) {
    super(initialState);
  }

  readonly loadInstruction = this.effect(() =>
    combineLatest([this.instructionId$, this.reload$]).pipe(
      switchMap(([instructionId]) =>
        this._demobaseStore.getInstruction(instructionId).pipe(
          tapResponse(
            (instruction) => this.patchState({ instruction }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadArguments = this.effect(() =>
    combineLatest([this.instructionId$, this.reload$]).pipe(
      switchMap(([instructionId]) =>
        this._demobaseStore.getInstructionArguments(instructionId).pipe(
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
    combineLatest([this.instructionId$, this.reload$]).pipe(
      switchMap(([instructionId]) =>
        this._demobaseStore.getInstructionAccounts(instructionId).pipe(
          tapResponse(
            (accounts) => this.patchState({ accounts }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly deleteInstructionArgument = this.effect(
    (argumentId$: Observable<string>) =>
      argumentId$.pipe(
        concatMap((argumentId) =>
          this._demobaseStore.deleteInstructionArgument(argumentId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly createInstructionArgument = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(withLatestFrom(this.applicationId$, this.instructionId$))
      ),
      exhaustMap(([, applicationId, instructionId]) =>
        this._matDialog
          .open(EditArgumentComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            concatMap(({ name, kind, modifier, size }) =>
              this._demobaseStore.createInstructionArgument(
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
                this._demobaseStore.updateInstructionArgument(
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
          this._demobaseStore.deleteInstructionAccount(accountId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly createInstructionAccount = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(withLatestFrom(this.applicationId$, this.instructionId$))
      ),
      exhaustMap(([, applicationId, instructionId]) =>
        this._matDialog
          .open(EditAccountComponent)
          .afterClosed()
          .pipe(
            concatMap(({ name, kind, markAttribute, collection }) =>
              this._demobaseStore.createInstructionAccount(
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
        exhaustMap((account) =>
          this._matDialog
            .open(EditAccountComponent, {
              data: { account },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, kind, markAttribute, collection }) =>
                this._demobaseStore.updateInstructionAccount(
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
