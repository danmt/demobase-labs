import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ViewApplicationComponent } from './view-application.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewApplicationComponent },
    ]),
  ],
  declarations: [ViewApplicationComponent],
})
export class ViewApplicationModule {}
