import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationModule } from '@demobase-labs/application/application/ui/navigation';

import { ShellApplicationComponent } from './shell.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ShellApplicationComponent,
        children: [
          {
            path: ':applicationId',
            loadChildren: () =>
              import(
                '@demobase-labs/application/application/features/view-application'
              ).then((m) => m.ViewApplicationModule),
          },
        ],
      },
    ]),
    NavigationModule,
  ],
  declarations: [ShellApplicationComponent],
})
export class ShellApplicationModule {}
