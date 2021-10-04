import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  Application,
  Collection,
  DemobaseService,
  Instruction,
} from '@demobase-labs/demobase-sdk';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { concatMap, exhaustMap, filter, switchMap, tap } from 'rxjs/operators';

import { DemobaseStore } from '../core/stores/demobase.store';
import { EditCollectionComponent } from '../shared/components/edit-collection.component';
import { EditInstructionComponent } from '../shared/components/edit-instruction.component';

interface ViewModel {
  application: Application | null;
  collections: Collection[];
  instructions: Instruction[];
}

const initialState: ViewModel = {
  application: null,
  collections: [],
  instructions: [],
};

@Injectable()
export class ApplicationStore extends ComponentStore<ViewModel> {
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
  readonly application$ = this.select(({ application }) => application);
  readonly collections$ = this.select(({ collections }) => collections);
  readonly instructions$ = this.select(({ instructions }) => instructions);

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _demobaseStore: DemobaseStore,
    private readonly _matDialog: MatDialog
  ) {
    super(initialState);
  }

  readonly loadApplication = this.effect(() =>
    combineLatest([this.applicationId$, this.reload$]).pipe(
      switchMap(([applicationId]) =>
        this._demobaseStore.getApplication(applicationId).pipe(
          tapResponse(
            (application) => this.patchState({ application }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadCollections = this.effect(() =>
    combineLatest([this.applicationId$, this.reload$]).pipe(
      switchMap(([applicationId]) =>
        this._demobaseStore.getCollections(applicationId).pipe(
          tapResponse(
            (collections) => this.patchState({ collections }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadInstructions = this.effect(() =>
    combineLatest([this.applicationId$, this.reload$]).pipe(
      switchMap(([applicationId]) =>
        this._demobaseStore.getInstructions(applicationId).pipe(
          tapResponse(
            (instructions) => this.patchState({ instructions }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly deleteCollection = this.effect((collectionId$: Observable<string>) =>
    collectionId$.pipe(
      concatMap((collectionId) =>
        this._demobaseStore.deleteCollection(collectionId)
      ),
      tap(() => this._reload.next(null))
    )
  );

  readonly createCollection = this.effect(
    (applicationId$: Observable<string>) =>
      applicationId$.pipe(
        exhaustMap((applicationId) =>
          this._matDialog
            .open(EditCollectionComponent)
            .afterClosed()
            .pipe(
              concatMap(({ name }) =>
                this._demobaseStore.createCollection(applicationId, name)
              )
            )
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly updateCollection = this.effect(
    (collection$: Observable<Collection>) =>
      collection$.pipe(
        exhaustMap((collection) =>
          this._matDialog
            .open(EditCollectionComponent, {
              data: { collection },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name }) =>
                this._demobaseStore.updateCollection(collection.id, name)
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
          this._demobaseStore.deleteInstruction(instructionId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly createInstruction = this.effect(
    (applicationId$: Observable<string>) =>
      applicationId$.pipe(
        exhaustMap((applicationId) =>
          this._matDialog
            .open(EditInstructionComponent)
            .afterClosed()
            .pipe(
              concatMap(({ name }) =>
                this._demobaseStore.createInstruction(applicationId, name)
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
            .open(EditInstructionComponent, {
              data: { instruction },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name }) =>
                this._demobaseStore.updateInstruction(instruction.id, name)
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
