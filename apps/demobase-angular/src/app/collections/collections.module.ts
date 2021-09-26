import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';

import { SharedModule } from '../shared/shared.module';
import { CollectionsComponent } from './collections.component';
import { CreateCollectionComponent } from './create-collection.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: CollectionsComponent,
        pathMatch: 'full',
      },
    ]),
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveComponentModule,
    SharedModule,
  ],
  declarations: [CollectionsComponent, CreateCollectionComponent],
})
export class CollectionsModule {}
