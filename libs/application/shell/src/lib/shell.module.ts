import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { ProgramStore } from '@demobase-labs/shared/data-access/program';

import { ShellComponent } from './shell.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ShellComponent,
        children: [
          {
            path: 'applications',
            loadChildren: () =>
              import('@demobase-labs/application/application/shell').then(
                (m) => m.ShellApplicationModule
              ),
          },
          {
            path: '**',
            redirectTo: 'applications',
          },
        ],
      },
    ]),
  ],
  declarations: [ShellComponent],
  providers: [ProgramStore, ConnectionStore, WalletStore],
})
export class ShellModule {}
