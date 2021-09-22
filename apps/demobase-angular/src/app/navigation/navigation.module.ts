import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ReactiveComponentModule } from '@ngrx/component';

import { ObscureAddressPipe } from '../obscure-address.pipe';
import { NavigationComponent } from './navigation.component';

@NgModule({
  declarations: [NavigationComponent, ObscureAddressPipe],
  imports: [CommonModule, ReactiveFormsModule, ReactiveComponentModule],
  exports: [NavigationComponent],
})
export class NavigationModule {}
