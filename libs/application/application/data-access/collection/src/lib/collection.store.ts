import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationStore } from '@demobase-labs/application/application/data-access/application';
import { EditCollectionComponent } from '@demobase-labs/application/application/ui/edit-collection';
import { Collection } from '@demobase-labs/demobase-sdk';
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
  collections: Collection[];
}

const initialState = {
  collections: [],
};

@Injectable()
export class CollectionStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  readonly collections$ = this.select(({ collections }) => collections);

  constructor(
    private readonly _programStore: ProgramStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _matDialog: MatDialog
  ) {
    super(initialState);
  }

  readonly loadCollections = this.effect(() =>
    combineLatest([
      this.reload$,
      this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
    ]).pipe(
      switchMap(([, applicationId]) =>
        this._programStore.getCollections(applicationId).pipe(
          tapResponse(
            (collections) => this.patchState({ collections }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly deleteCollection = this.effect((collectionId$: Observable<string>) =>
    collectionId$.pipe(
      concatMap((collectionId) =>
        this._programStore.deleteCollection(collectionId)
      ),
      tap(() => this._reload.next(null))
    )
  );

  readonly createCollection = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditCollectionComponent)
          .afterClosed()
          .pipe(
            withLatestFrom(
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ name }, applicationId]) =>
              this._programStore.createCollection(applicationId, name)
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
            .open(EditCollectionComponent, { data: { collection } })
            .afterClosed()
            .pipe(
              concatMap(({ name }) =>
                this._programStore.updateCollection(collection.id, name)
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
