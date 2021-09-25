import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { SharedModule } from '../shared/shared.module';

import { ApplicationComponent } from './application.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ApplicationComponent,
        pathMatch: 'full',
      },
    ]),
    ReactiveFormsModule,
    ReactiveComponentModule,
    SharedModule,
  ],
  declarations: [ApplicationComponent],
})
export class ApplicationModule {}
