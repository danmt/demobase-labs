import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';

import { SharedModule } from '../shared/shared.module';
import { CollectionComponent } from './collection.component';

import { MatExpansionModule } from '@angular/material/expansion';
import { CollectionInstructionsComponent } from './instructions.component';
import { CollectionContextComponent } from './context.component';

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
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    ReactiveComponentModule,
    SharedModule,
  ],
  declarations: [
    CollectionComponent,
    CollectionInstructionsComponent,
    CollectionContextComponent,
  ],
})
export class CollectionModule {}
