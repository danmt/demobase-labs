import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Collection, Instruction } from '@demobase-labs/demobase-sdk';
import { ProgramStore } from '@demobase-labs/shared/data-access/program';
import { ApplicationStore } from '@demobase-labs/application/application/data-access/application';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Observable, of, Subject } from 'rxjs';
import { concatMap, filter, tap, withLatestFrom } from 'rxjs/operators';

export type TabKind = 'collections' | 'instructions';

interface ViewModel {
  tabs: ({ kind: TabKind } & (Collection | Instruction))[];
  selected: string | null;
}

const initialState: ViewModel = {
  tabs: [],
  selected: null,
};

@Injectable()
export class TabsStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  readonly tabs$ = this.select(({ tabs }) => tabs);
  readonly selected$ = this.select(({ selected }) => selected, {
    debounce: true,
  });

  constructor(
    private readonly _programStore: ProgramStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _router: Router
  ) {
    super(initialState);
  }

  openCollectionTab = this.effect((collectionId$: Observable<string>) =>
    collectionId$.pipe(
      tap((collectionId) => this.patchState({ selected: collectionId })),
      concatMap((collectionId) =>
        of(collectionId).pipe(
          withLatestFrom(this.tabs$),
          filter(
            ([collectionId, tabs]) =>
              !tabs.some(({ id }) => id === collectionId)
          )
        )
      ),
      concatMap(([collectionId, tabs]) =>
        this._programStore.getCollection(collectionId).pipe(
          tapResponse(
            (collection) =>
              this.patchState({
                tabs: [...tabs, { ...collection, kind: 'collections' }],
              }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  openInstructionTab = this.effect((instructionId$: Observable<string>) =>
    instructionId$.pipe(
      tap((instructionId) => this.patchState({ selected: instructionId })),
      concatMap((instructionId) =>
        of(instructionId).pipe(
          withLatestFrom(this.tabs$),
          filter(
            ([instructionId, tabs]) =>
              !tabs.some(({ id }) => id === instructionId)
          )
        )
      ),
      concatMap(([instructionId, tabs]) =>
        this._programStore.getInstruction(instructionId).pipe(
          tapResponse(
            (instruction) =>
              this.patchState({
                tabs: [...tabs, { ...instruction, kind: 'instructions' }],
              }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  closeTab = this.effect((tabId$: Observable<string>) =>
    tabId$.pipe(
      concatMap((tabId) =>
        of(tabId).pipe(
          withLatestFrom(
            this.tabs$,
            this.selected$,
            this._applicationStore.applicationId$
          )
        )
      ),
      tap(([tabId, tabs, selectedTab, applicationId]) => {
        const changes: Partial<ViewModel> = {
          tabs: tabs.filter((tab) => tab.id !== tabId),
        };

        if (changes.tabs?.length === 0) {
          this._router.navigate(['/applications', applicationId]);
        } else {
          const firstTab = changes.tabs ? changes.tabs[0] : null;

          if (firstTab && tabId === selectedTab) {
            changes.selected = firstTab.id;
            this._router.navigate([
              '/applications',
              applicationId,
              firstTab.kind,
              firstTab.id,
            ]);
          }
        }

        this.patchState(changes);
      })
    )
  );
}
