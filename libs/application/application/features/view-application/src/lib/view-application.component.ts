import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationStore } from '@demobase-labs/application/application/data-access/application';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'demobase-labs-application-view-application',
  template: `view application`,
})
export class ViewApplicationComponent implements OnInit {
  constructor(
    private readonly _applicationStore: ApplicationStore,
    private readonly _route: ActivatedRoute
  ) {}

  ngOnInit() {
    this._applicationStore.selectApplication(
      this._route.paramMap.pipe(
        filter((paramMap) => paramMap.has('applicationId')),
        map((paramMap) => paramMap.get('applicationId') as string)
      )
    );
  }
}
