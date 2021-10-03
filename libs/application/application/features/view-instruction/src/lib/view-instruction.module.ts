import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ViewInstructionComponent } from './view-instruction.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewInstructionComponent },
    ]),
  ],
  declarations: [ViewInstructionComponent],
})
export class ViewInstructionModule {}
