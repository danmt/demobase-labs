import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabsStore } from '@demobase-labs/application/application/data-access/tabs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'demobase-labs-view-collection',
  template: ` <p>view-collection works!</p> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewCollectionComponent implements OnInit {
  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _tabsStore: TabsStore
  ) {}

  ngOnInit() {
    this._tabsStore.openCollectionTab(
      this._route.paramMap.pipe(
        filter((paramMap) => paramMap.has('collectionId')),
        map((paramMap) => paramMap.get('collectionId') as string)
      )
    );
  }
}
