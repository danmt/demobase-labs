import { Component } from '@angular/core';
import { ApplicationStore } from '@demobase-labs/application/application/data-access/application';
import { CollectionStore } from '@demobase-labs/application/application/data-access/collection';
import { InstructionStore } from '@demobase-labs/application/application/data-access/instruction';

@Component({
  selector: 'demobase-labs-application-shell',
  template: `
    <demobase-labs-application-navigation>
      <router-outlet></router-outlet>
    </demobase-labs-application-navigation>
  `,
  providers: [ApplicationStore, CollectionStore, InstructionStore],
})
export class ShellApplicationComponent {}
