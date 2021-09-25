import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
  ConnectionStore,
  WALLET_CONFIG,
  WalletStore,
} from '@danmt/wallet-adapter-angular';
import { DemobaseService } from '@demobase-labs/demobase-sdk';
import { ReactiveComponentModule } from '@ngrx/component';
import {
  getPhantomWallet,
  getSolletWallet,
} from '@solana/wallet-adapter-wallets';

import { AppComponent } from './app.component';
import { AuthGuard } from './core/guards/auth.guard';
import { CoreModule } from './core/core.module';
import { UnauthorizedComponent } from './core/components/unauthorized.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: 'applications',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./applications/applications.module').then(
                (m) => m.ApplicationsModule
              ),
          },
          {
            path: ':applicationId',
            loadChildren: () =>
              import('./application/application.module').then(
                (m) => m.ApplicationModule
              ),
          },
        ],
      },
      {
        path: 'collections',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./collections/collections.module').then(
                (m) => m.CollectionsModule
              ),
          },
          {
            path: ':applicationId/:collectionId',
            loadChildren: () =>
              import('./collection/collection.module').then(
                (m) => m.CollectionModule
              ),
          },
        ],
      },
      {
        path: 'instructions',
        canActivate: [AuthGuard],
        children: [
          {
            path: ':applicationId/:collectionId/:instructionId',
            loadChildren: () =>
              import('./instruction/instruction.module').then(
                (m) => m.InstructionModule
              ),
          },
        ],
      },
      {
        path: 'unauthorized',
        component: UnauthorizedComponent,
      },
      {
        path: '**',
        redirectTo: 'applications',
      },
    ]),
    ReactiveFormsModule,
    ReactiveComponentModule,
    CoreModule,
  ],
  providers: [
    {
      provide: WALLET_CONFIG,
      useValue: {
        wallets: [getPhantomWallet(), getSolletWallet()],
        autoConnect: true,
      },
    },
    {
      provide: DemobaseService,
      useClass: DemobaseService,
    },
    AuthGuard,
    ConnectionStore,
    WalletStore,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
