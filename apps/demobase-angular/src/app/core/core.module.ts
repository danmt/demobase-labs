import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';

import { SharedModule } from '../shared/shared.module';
import { NavigationComponent } from '../core/components/navigation.component';
import { UnauthorizedComponent } from './components/unauthorized.component';

@NgModule({
  declarations: [NavigationComponent, UnauthorizedComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    SharedModule,
  ],
  exports: [NavigationComponent, UnauthorizedComponent],
})
export class CoreModule {}
