import { Idl, Program, Provider, utils, Wallet } from '@project-serum/anchor';
import {
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';

import * as idl from './idl.json';
import { Application, RawApplication } from './types';
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

  static create(connection: Connection, wallet: Wallet, opts: ConfirmOptions) {
    const provider = new Provider(connection, wallet, opts);
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

  async getApplication(applicationId: PublicKey): Promise<Application> {
    const application = (await this._program.account.application.fetch(
      applicationId
    )) as RawApplication;

    return {
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          application.name.filter((segment: number) => segment !== 0)
        )
      ),
      count: application.count.toNumber(),
    };
  }
}
