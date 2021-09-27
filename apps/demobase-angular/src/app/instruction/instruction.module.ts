import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';

import { SharedModule } from '../shared/shared.module';
import { CreateAccountComponent } from './create-account.component';
import { EditArgumentComponent } from './edit-argument.component';
import { InstructionComponent } from './instruction.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: InstructionComponent,
        pathMatch: 'full',
      },
    ]),
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    ReactiveComponentModule,
    SharedModule,
  ],
  declarations: [
    InstructionComponent,
    CreateAccountComponent,
    EditArgumentComponent,
  ],
})
export class InstructionModule {}
