import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { isNotNullOrUndefined } from '../../shared/operators/is-not-null-or-undefined.operator';
import { MatDialog } from '@angular/material/dialog';
import { ConnectWalletComponent } from './connect-wallet.component';

@Component({
  selector: 'demobase-navigation',
  template: `
    <mat-sidenav-container class="sidenav-container" fullscreen>
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false"
      >
        <figure class="mt-4 w-full flex justify-center">
          <img src="assets/images/logo.png" class="w-4/6" />
        </figure>
        <h2 class="mt-4 text-center">DEMOBASE</h2>
        <mat-nav-list>
          <a mat-list-item [routerLink]="['/applications']">Applications</a>
          <a mat-list-item [routerLink]="['/collections']">Collections</a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async"
          >
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>

          <ng-container *ngrxLet="connected$; let connected">
            <div *ngIf="!connected" class="ml-auto">
              <button mat-raised-button color="accent" (click)="onConnect()">
                Connect
              </button>
            </div>

            <div *ngIf="connected" class="ml-auto flex items-center">
              <ng-container *ngIf="address$ | ngrxPush as address">
                {{ address | obscureAddress }}
              </ng-container>
              <button
                mat-raised-button
                color="warn"
                class="ml-4"
                (click)="onDisconnect()"
              >
                Disconnect
              </button>
            </div>
          </ng-container>
        </mat-toolbar>
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav-container {
        height: 100%;
      }

      .sidenav {
        width: 200px;
      }

      .sidenav .mat-toolbar {
        background: inherit;
      }

      .mat-toolbar.mat-primary {
        position: sticky;
        top: 0;
        z-index: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
  readonly connected$ = this._walletStore.connected$;
  readonly address$ = this._walletStore.publicKey$.pipe(
    isNotNullOrUndefined,
    map((publicKey) => publicKey.toBase58())
  );
  readonly isHandset$: Observable<boolean> = this._breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _walletStore: WalletStore,
    private readonly _matDialog: MatDialog
  ) {}

  onConnect() {
    this._matDialog.open(ConnectWalletComponent);
  }

  onDisconnect() {
    if (confirm('Are you sure?')) {
      this._walletStore.disconnect().subscribe();
    }
  }
}
