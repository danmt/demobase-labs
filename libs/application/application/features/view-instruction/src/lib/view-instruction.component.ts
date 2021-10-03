import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabsStore } from '@demobase-labs/application/application/data-access/tabs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'demobase-labs-view-instruction',
  template: ` <p>view-instruction works!</p> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewInstructionComponent implements OnInit {
  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _tabsStore: TabsStore
  ) {}

  ngOnInit() {
    this._tabsStore.openInstructionTab(
      this._route.paramMap.pipe(
        filter((paramMap) => paramMap.has('instructionId')),
        map((paramMap) => paramMap.get('instructionId') as string)
      )
    );
  }
}
