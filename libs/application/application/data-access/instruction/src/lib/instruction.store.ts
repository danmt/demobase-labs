import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationStore } from '@demobase-labs/application/application/data-access/application';
import { EditInstructionComponent } from '@demobase-labs/application/application/ui/edit-instruction';
import { Instruction } from '@demobase-labs/demobase-sdk';
import { ProgramStore } from '@demobase-labs/shared/data-access/program';
import { isNotNullOrUndefined } from '@demobase-labs/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import {
  concatMap,
  exhaustMap,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

interface ViewModel {
  instructions: Instruction[];
}

const initialState = {
  instructions: [],
};

@Injectable()
export class InstructionStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  readonly instructions$ = this.select(({ instructions }) => instructions);

  constructor(
    private readonly _programStore: ProgramStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _matDialog: MatDialog
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

  reload() {
    this._reload.next(null);
  }
}
