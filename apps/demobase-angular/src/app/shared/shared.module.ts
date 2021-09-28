import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveComponentModule } from '@ngrx/component';
import { EditAccountComponent } from './components/edit-account.component';
import { EditArgumentComponent } from './components/edit-argument.component';
import { EditAttributeComponent } from './components/edit-attribute.component';
import { EditInstructionComponent } from './components/edit-instruction.component';
import { PageHeaderDirective } from './directives/page-header.directive';
import { ObscureAddressPipe } from './pipes/obscure-address.pipe';
import { SanitizeUrlPipe } from './pipes/sanitize-url.pipe';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveComponentModule
  ],
  exports: [
    ObscureAddressPipe,
    SanitizeUrlPipe,
    PageHeaderDirective,
    EditInstructionComponent,
    EditAccountComponent,
    EditArgumentComponent,
    EditAttributeComponent
  ],
  declarations: [
    ObscureAddressPipe,
    SanitizeUrlPipe,
    PageHeaderDirective,
    EditInstructionComponent,
    EditAccountComponent,
    EditArgumentComponent,
    EditAttributeComponent
  ],
})
export class SharedModule {}
