import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Collection,
  CollectionAttribute,
  DemobaseService,
} from '@demobase-labs/demobase-sdk';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  combineLatest,
  defer,
  from,
  Observable,
  of,
  Subject,
} from 'rxjs';
import {
  concatMap,
  exhaustMap,
  filter,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { DemobaseStore } from '../core/stores/demobase.store';

import { EditAttributeComponent } from '../shared/components/edit-attribute.component';
import { EditCollectionComponent } from '../shared/components/edit-collection.component';

interface ViewModel {
  collection: Collection | null;
  attributes: CollectionAttribute[];
}

const initialState: ViewModel = {
  collection: null,
  attributes: [],
};

@Injectable()
export class CollectionStore extends ComponentStore<ViewModel> {
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
  readonly collectionId$ = this.select(
    this._route.paramMap.pipe(
      filter((paramMap) => paramMap.has('collectionId'))
    ),
    (paramMap) => paramMap.get('collectionId') as string
  );
  readonly collection$ = this.select(({ collection }) => collection);
  readonly attributes$ = this.select(({ attributes }) => attributes);

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _demobaseService: DemobaseService,
    private readonly _matDialog: MatDialog,
    private readonly _demobaseStore: DemobaseStore
  ) {
    super(initialState);
  }

  readonly loadCollection = this.effect(() =>
    combineLatest([this.collectionId$, this.reload$]).pipe(
      concatMap(([collectionId]) =>
        from(
          defer(() => this._demobaseService.getCollection(collectionId))
        ).pipe(
          tapResponse(
            (collection) => this.patchState({ collection }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadAttributes = this.effect(() =>
    combineLatest([this.collectionId$, this.reload$]).pipe(
      concatMap(([collectionId]) =>
        from(
          defer(() =>
            this._demobaseService.getCollectionAttributes(collectionId)
          )
        ).pipe(
          tapResponse(
            (attributes) => this.patchState({ attributes }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly deleteCollectionAttribute = this.effect(
    (attributeId$: Observable<string>) =>
      attributeId$.pipe(
        concatMap((attributeId) =>
          this._demobaseStore.deleteCollectionAttribute(attributeId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly createCollectionAttribute = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(withLatestFrom(this.applicationId$, this.collectionId$))
      ),
      exhaustMap(([, applicationId, collectionId]) =>
        this._matDialog
          .open(EditAttributeComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            concatMap(({ name, kind, modifier, size }) =>
              this._demobaseStore.createCollectionAttribute(
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
                this._demobaseStore.updateCollectionAttribute(
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
