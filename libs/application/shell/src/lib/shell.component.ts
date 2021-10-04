import { Component, OnInit } from '@angular/core';
import { ConnectionStore } from '@danmt/wallet-adapter-angular';

@Component({
  selector: 'demobase-labs-shell',
  template: `<router-outlet></router-outlet>`,
})
export class ShellComponent implements OnInit {
  constructor(private readonly _connectionStore: ConnectionStore) {}

  ngOnInit() {
    this._connectionStore.setEndpoint('http://localhost:8899');
  }
}
