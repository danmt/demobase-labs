import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ObscureAddressPipe } from './obscure-address.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [ObscureAddressPipe],
  exports: [ObscureAddressPipe],
})
export class ObscureAddressModule {}
