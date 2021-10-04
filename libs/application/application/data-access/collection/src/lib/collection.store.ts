import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationStore } from '@demobase-labs/application/application/data-access/application';
import { EditAttributeComponent } from '@demobase-labs/application/application/ui/edit-attribute';
import { EditCollectionComponent } from '@demobase-labs/application/application/ui/edit-collection';
import { Collection, CollectionAttribute } from '@demobase-labs/demobase-sdk';
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
  collections: Collection[];
  collectionId: string | null;
  attributes: CollectionAttribute[];
}

const initialState = {
  collections: [],
  collectionId: null,
  attributes: [],
};

@Injectable()
export class CollectionStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  readonly collections$ = this.select(({ collections }) => collections);
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly attributes$ = this.select(({ attributes }) => attributes);

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

  readonly loadAttributes = this.effect(() =>
    combineLatest([
      this.reload$,
      this.collectionId$.pipe(isNotNullOrUndefined),
    ]).pipe(
      concatMap(([, collectionId]) =>
        this._programStore.getCollectionAttributes(collectionId).pipe(
          tapResponse(
            (attributes) => this.patchState({ attributes }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly selectCollection = this.effect(
    (collectionId$: Observable<string | null>) =>
      collectionId$.pipe(
        tap((collectionId) => this.patchState({ collectionId }))
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

  readonly deleteCollectionAttribute = this.effect(
    (attributeId$: Observable<string>) =>
      attributeId$.pipe(
        concatMap((attributeId) =>
          this._programStore.deleteCollectionAttribute(attributeId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly createCollectionAttribute = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(
            this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
            this.collectionId$.pipe(isNotNullOrUndefined)
          )
        )
      ),
      exhaustMap(([, applicationId, collectionId]) =>
        this._matDialog
          .open(EditAttributeComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            concatMap(({ name, kind, modifier, size }) =>
              this._programStore.createCollectionAttribute(
                applicationId,
                collectionId,
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

  readonly updateCollectionAttribute = this.effect(
    (attribute$: Observable<CollectionAttribute>) =>
      attribute$.pipe(
        exhaustMap((attribute) =>
          this._matDialog
            .open(EditAttributeComponent, {
              data: { attribute },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, kind, modifier, size }) =>
                this._programStore.updateCollectionAttribute(
                  attribute.id,
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

  reload() {
    this._reload.next(null);
  }
}
