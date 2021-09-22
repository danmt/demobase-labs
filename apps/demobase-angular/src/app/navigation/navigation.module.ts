import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';

import { ObscureAddressPipe } from '../obscure-address.pipe';
import { NavigationComponent } from './navigation.component';

@NgModule({
  declarations: [NavigationComponent, ObscureAddressPipe],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
  ],
  exports: [NavigationComponent],
})
export class NavigationModule {}
