import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Collection,
  CollectionAttribute,
  CollectionInstruction,
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
import { concatMap, filter, tap, withLatestFrom } from 'rxjs/operators';

import { EditAttributeComponent } from '../shared/components/edit-attribute.component';
import { EditCollectionComponent } from '../shared/components/edit-collection.component';
import { EditInstructionComponent } from '../shared/components/edit-instruction.component';

interface ViewModel {
  collection: Collection | null;
  attributes: CollectionAttribute[];
  instructions: CollectionInstruction[];
}

const initialState: ViewModel = {
  collection: null,
  attributes: [],
  instructions: [],
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
  readonly instructions$ = this.select(({ instructions }) => instructions);

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _demobaseService: DemobaseService,
    private readonly _matDialog: MatDialog
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

  readonly loadInstructions = this.effect(() =>
    combineLatest([this.collectionId$, this.reload$]).pipe(
      concatMap(([collectionId]) =>
        from(
          defer(() =>
            this._demobaseService.getCollectionInstructions(collectionId)
          )
        ).pipe(
          tapResponse(
            (instructions) => this.patchState({ instructions }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  openEditCollection = this.effect(
    (collection$: Observable<Collection | undefined>) =>
      collection$.pipe(
        tap((collection) =>
          this._matDialog.open(EditCollectionComponent, {
            data: {
              collection,
            },
          })
        )
      )
  );

  deleteCollection = this.effect((collectionId$: Observable<string>) =>
    collectionId$.pipe(
      tap((collectionId) =>
        this._demobaseService.deleteCollection(collectionId)
      )
    )
  );

  openEditAttribute = this.effect(
    (attribute$: Observable<CollectionAttribute | undefined>) =>
      attribute$.pipe(
        concatMap((attribute) =>
          of(attribute).pipe(
            withLatestFrom(this.applicationId$, this.collectionId$)
          )
        ),
        tap(([attribute, applicationId, collectionId]) =>
          this._matDialog.open(EditAttributeComponent, {
            data: {
              applicationId,
              collectionId,
              attribute,
            },
          })
        )
      )
  );

  deleteAttribute = this.effect((attributeId$: Observable<string>) =>
    attributeId$.pipe(
      tap((attributeId) =>
        this._demobaseService.deleteCollectionAttribute(attributeId)
      )
    )
  );

  openEditInstruction = this.effect(
    (instruction$: Observable<CollectionInstruction | undefined>) =>
      instruction$.pipe(
        concatMap((instruction) =>
          of(instruction).pipe(
            withLatestFrom(this.applicationId$, this.collectionId$)
          )
        ),
        tap(([instruction, applicationId, collectionId]) =>
          this._matDialog.open(EditInstructionComponent, {
            data: {
              applicationId,
              collectionId,
              instruction,
            },
          })
        )
      )
  );

  deleteInstruction = this.effect((instructionId$: Observable<string>) =>
    instructionId$.pipe(
      tap((instructionId) =>
        this._demobaseService.deleteCollectionInstruction(instructionId)
      )
    )
  );

  reload() {
    this._reload.next(null);
  }
}
