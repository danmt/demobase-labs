import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SanitizeUrlPipe } from './sanitize-url.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [SanitizeUrlPipe],
  exports: [SanitizeUrlPipe],
})
export class SanitizeUrlModule {}
