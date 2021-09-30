import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { CollectionInstruction } from '@demobase-labs/demobase-sdk';

@Component({
  selector: 'demobase-collection-instructions',
  template: `
    <mat-accordion multi>
      <mat-expansion-panel *ngFor="let instruction of instructions">
        <mat-expansion-panel-header>
          <mat-panel-title> {{ instruction.data.name }} </mat-panel-title>
        </mat-expansion-panel-header>

        Function body
      </mat-expansion-panel>
    </mat-accordion>

    <ng-template #emptyList>
      <p class="text-center text-xl">There's no instructions yet.</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionInstructionsComponent {
  @HostBinding('class') class = 'block p-4';
  @Input() connected: boolean | null = null;
  @Input() instructions: CollectionInstruction[] | null = null;
  @Output() reload = new EventEmitter();
  @Output() createInstruction = new EventEmitter();
  @Output() editInstruction = new EventEmitter<CollectionInstruction>();
  @Output() deleteInstruction = new EventEmitter<string>();
}
