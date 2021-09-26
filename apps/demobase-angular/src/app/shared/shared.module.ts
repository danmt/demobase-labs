import { NgModule } from '@angular/core';
import { PageHeaderDirective } from './directives/page-header.directive';
import { ObscureAddressPipe } from './pipes/obscure-address.pipe';
import { SanitizeUrlPipe } from './pipes/sanitize-url.pipe';

@NgModule({
  exports: [ObscureAddressPipe, SanitizeUrlPipe, PageHeaderDirective],
  declarations: [ObscureAddressPipe, SanitizeUrlPipe, PageHeaderDirective],
})
export class SharedModule {}
