import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { WalletStore } from '@danmt/wallet-adapter-angular';

@Component({
  selector: 'demobase-connect-wallet',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      <span>Select Wallet</span>
      <button
        mat-icon-button
        mat-dialog-close
        aria-label="Close wallet selection"
      >
        <mat-icon>close</mat-icon>
      </button>
    </h2>
    <mat-selection-list
      [multiple]="false"
      (selectionChange)="onSelectionChange($event)"
    >
      <mat-list-option
        *ngFor="let wallet of wallets$ | ngrxPush; last as isLast"
        [value]="wallet.name"
        [ngClass]="{
          'bottom-separator': !isLast
        }"
      >
        <div class="flex justify-between items-center">
          <p class="m-0">{{ wallet.name }}</p>
          <img class="w-6 h-6" [src]="wallet.icon | sanitizeUrl" alt="" />
        </div>
      </mat-list-option>
    </mat-selection-list>
  `,
})
export class ConnectWalletComponent {
  readonly wallets$ = this._walletStore.wallets$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _matDialogRef: MatDialogRef<ConnectWalletComponent>
  ) {}

  onSelectionChange({ options }: MatSelectionListChange): void {
    const [option] = options;

    this._walletStore.selectWallet(option.value || null);
    this._matDialogRef.close();
  }
}
