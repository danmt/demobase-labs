import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { SharedModule } from '../shared/shared.module';

import { CollectionComponent } from './collection.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: CollectionComponent,
        pathMatch: 'full',
      },
    ]),
    ReactiveFormsModule,
    ReactiveComponentModule,
    SharedModule,
  ],
  exports: [],
  declarations: [CollectionComponent],
  providers: [],
})
export class CollectionModule {}
