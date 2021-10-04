import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditApplicationComponent } from '@demobase-labs/application/application/ui/edit-application';
import { Application } from '@demobase-labs/demobase-sdk';
import { ProgramStore } from '@demobase-labs/shared/data-access/program';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap, exhaustMap, filter, switchMap, tap } from 'rxjs/operators';

interface ViewModel {
  applicationId: string | null;
  applications: Application[];
}

const initialState = {
  applicationId: null,
  applications: [],
};

@Injectable()
export class ApplicationStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  readonly applications$ = this.select(({ applications }) => applications);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly application$ = this.select(
    this.applications$,
    this.applicationId$,
    (applications, applicationId) =>
      applications.find(({ id }) => id === applicationId) || null
  );

  constructor(
    private readonly _programStore: ProgramStore,
    private readonly _matDialog: MatDialog
  ) {
    super(initialState);
  }

  readonly loadApplications = this.effect(() =>
    this.reload$.pipe(
      switchMap(() =>
        this._programStore.getApplications().pipe(
          tapResponse(
            (applications) => this.patchState({ applications }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly selectApplication = this.effect(
    (applicationId$: Observable<string>) =>
      applicationId$.pipe(
        tap((applicationId) => this.patchState({ applicationId }))
      )
  );

  readonly deleteApplication = this.effect(
    (applicationId$: Observable<string>) =>
      applicationId$.pipe(
        concatMap((applicationId) =>
          this._programStore.deleteApplication(applicationId)
        ),
        tap(() => this._reload.next(null))
      )
  );

  readonly createApplication = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditApplicationComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            concatMap(({ name }) => this._programStore.createApplication(name))
          )
      ),
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
              filter((data) => data),
              concatMap(({ name }) =>
                this._programStore.updateApplication(application.id, name)
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
