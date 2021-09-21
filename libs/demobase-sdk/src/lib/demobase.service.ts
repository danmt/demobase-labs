import { Idl, Program, Provider } from '@project-serum/anchor';
import {
  ConfirmOptions,
  Connection,
  Keypair,
  SystemProgram,
} from '@solana/web3.js';

import * as idl from './idl.json';
import { Wallet } from './types';
import { DEMOBASE_PROGRAM_ID } from './utils';

export class DemobaseService {
  get programId() {
    return this._program.programId;
  }

  get connection() {
    return this._program.provider.connection;
  }

  get wallet() {
    return this._program.provider.wallet;
  }

  constructor(private _program: Program) {}

  static create(connection: Connection, wallet: Wallet, opts?: ConfirmOptions) {
    const provider = new Provider(
      connection,
      wallet,
      opts || Provider.defaultOptions()
    );

    const program = new Program(idl as Idl, DEMOBASE_PROGRAM_ID, provider);
    const service = new DemobaseService(program);

    return service;
  }

  static fromProgram(program: Program) {
    const service = new DemobaseService(program);

    return service;
  }

  async createApplication(applicationName: string) {
    const application = Keypair.generate();

    return this._program.rpc.createApplication(applicationName, {
      accounts: {
        application: application.publicKey,
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [application],
    });
  }
}
