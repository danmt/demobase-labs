import { NgModule } from '@angular/core';
import { ObscureAddressPipe } from './pipes/obscure-address.pipe';

@NgModule({
  exports: [ObscureAddressPipe],
  declarations: [ObscureAddressPipe],
})
export class SharedModule {}
