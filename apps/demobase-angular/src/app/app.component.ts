import { Component, OnInit } from '@angular/core';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';

@Component({
  selector: 'demobase-root',
  template: `
    <demobase-navigation></demobase-navigation>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [],
  providers: [ConnectionStore, WalletStore],
})
export class AppComponent implements OnInit {
  constructor(private readonly _connectionStore: ConnectionStore) {}

  ngOnInit() {
    this._connectionStore.setEndpoint('http://localhost:8899');
  }
}
