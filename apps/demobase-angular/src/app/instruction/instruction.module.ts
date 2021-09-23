import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { InstructionComponent } from './instruction.component';

@NgModule({
  declarations: [InstructionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: InstructionComponent,
        pathMatch: 'full',
      },
    ]),
    ReactiveComponentModule,
  ],
})
export class InstructionModule {}
