import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Application } from '@demobase-labs/demobase-sdk';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap, exhaustMap, switchMap, tap } from 'rxjs/operators';

import { DemobaseStore } from '../core/stores/demobase.store';
import { EditApplicationComponent } from '../shared/components/edit-application.component';

interface ViewModel {
  applications: Application[];
}

const initialState = {
  applications: [],
};

@Injectable()
export class ApplicationsStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  readonly applications$ = this.select(({ applications }) => applications);

  constructor(
    private readonly _demobaseStore: DemobaseStore,
    private readonly _matDialog: MatDialog
  ) {
    super(initialState);
  }

  readonly loadApplications = this.effect(() =>
    this.reload$.pipe(
      switchMap(() =>
        this._demobaseStore.getApplications().pipe(
          tapResponse(
            (applications) => this.patchState({ applications }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly deleteApplication = this.effect(
    (applicationId$: Observable<string>) =>
      applicationId$.pipe(
        concatMap((applicationId) =>
          this._demobaseStore.deleteApplication(applicationId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly createApplication = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog.open(EditApplicationComponent).afterClosed()
      ),
      concatMap(({ name }) => this._demobaseStore.createApplication(name)),
      tap(() => this._reload.next(null))
    )
  );

  readonly updateApplication = this.effect(
    (application$: Observable<Application>) =>
      application$.pipe(
        exhaustMap((application) =>
          this._matDialog
            .open(EditApplicationComponent, { data: { application } })
            .afterClosed()
            .pipe(
              concatMap(({ name }) =>
                this._demobaseStore.updateApplication(application.id, name)
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
