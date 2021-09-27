import { Idl, Program, Provider } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';

import * as idl from './idl.json';
import {
  Application,
  Collection,
  CollectionAttribute,
  CollectionInstruction,
  InstructionAccount,
  InstructionArgument,
  Wallet,
} from './types';
import {
  ApplicationParser,
  CollectionAttributeParser,
  CollectionInstructionParser,
  CollectionParser,
  DEMOBASE_PROGRAM_ID,
  DummyWallet,
  InstructionAccountParser,
  InstructionArgumentParser,
} from './utils';

export class DemobaseService {
  private readonly _programId = DEMOBASE_PROGRAM_ID;
  private _programReader: Program | null = null;
  private _programWriter: Program | null = null;
  private _connection: Connection | null = null;
  private _wallet: Wallet | null = null;

  get programId() {
    return this._programId;
  }

  get connection() {
    return this._connection;
  }

  get wallet() {
    return this._wallet;
  }

  get writer() {
    return this._programWriter;
  }

  get reader() {
    return this._programReader;
  }

  setConnection(connection: Connection) {
    this._connection = connection;
    this._programReader = new Program(
      idl as Idl,
      DEMOBASE_PROGRAM_ID,
      new Provider(connection, new DummyWallet(), Provider.defaultOptions())
    );
    this._programWriter = this.wallet
      ? new Program(
          idl as Idl,
          DEMOBASE_PROGRAM_ID,
          new Provider(connection, this.wallet, Provider.defaultOptions())
        )
      : null;
  }

  setWallet(wallet: Wallet | null) {
    this._wallet = wallet;
    this._programWriter =
      this.connection && this.wallet
        ? new Program(
            idl as Idl,
            DEMOBASE_PROGRAM_ID,
            new Provider(
              this.connection,
              this.wallet,
              Provider.defaultOptions()
            )
          )
        : null;
  }

  async createApplication(applicationName: string) {
    if (!this.writer) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const application = Keypair.generate();

    return this.writer.rpc.createApplication(applicationName, {
      accounts: {
        application: application.publicKey,
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [application],
    });
  }

  async getApplications() {
    if (!this.reader) {
      throw Error('Program is not available');
    }

    const programAccounts = await this.reader.account.application.all([]);

    return programAccounts.map(({ publicKey, account }) =>
      ApplicationParser(publicKey, account)
    );
  }

  async getApplication(applicationId: string): Promise<Application | null> {
    if (!this.reader) {
      throw Error('Program is not available');
    }

    const account = await this.reader.account.application.fetchNullable(
      applicationId
    );

    return account && ApplicationParser(new PublicKey(applicationId), account);
  }

  async createCollection(applicationId: string, collectionName: string) {
    if (!this.writer) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const collection = Keypair.generate();

    return this.writer.rpc.createCollection(collectionName, {
      accounts: {
        collection: collection.publicKey,
        application: new PublicKey(applicationId),
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [collection],
    });
  }

  async getCollections(): Promise<Collection[]> {
    if (!this.reader) {
      throw Error('Program is not available');
    }

    const programAccounts = await this.reader.account.collection.all();

    return programAccounts.map(({ publicKey, account }) =>
      CollectionParser(publicKey, account)
    );
  }

  async getCollectionsByApplication(
    applicationId: string
  ): Promise<Collection[]> {
    if (!this.reader) {
      throw Error('Program is not available');
    }

    const programAccounts = await this.reader.account.collection.all([
      {
        memcmp: {
          bytes: applicationId,
          offset: 40,
        },
      },
    ]);

    return programAccounts.map(({ publicKey, account }) =>
      CollectionParser(publicKey, account)
    );
  }

  async getCollection(collectionId: string): Promise<Collection | null> {
    if (!this.reader) {
      throw Error('Program is not available');
    }

    const account = await this.reader.account.collection.fetchNullable(
      collectionId
    );

    return account && CollectionParser(new PublicKey(collectionId), account);
  }

  async createCollectionAttribute(
    applicationId: string,
    collectionId: string,
    attributeName: string,
    attributeKind: number,
    attributeModifier: number,
    attributeSize: number
  ) {
    if (!this.writer) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const attribute = Keypair.generate();

    return this.writer.rpc.createCollectionAttribute(
      attributeName,
      attributeKind,
      attributeModifier,
      attributeSize,
      {
        accounts: {
          application: new PublicKey(applicationId),
          collection: new PublicKey(collectionId),
          attribute: attribute.publicKey,
          authority: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [attribute],
      }
    );
  }

  async getCollectionAttributes(
    collectionId: string
  ): Promise<CollectionAttribute[]> {
    if (!this.reader) {
      throw Error('Program is not available');
    }

    const programAccounts = await this.reader.account.collectionAttribute.all([
      {
        memcmp: {
          bytes: collectionId,
          offset: 72,
        },
      },
    ]);

    return programAccounts.map(({ account, publicKey }) =>
      CollectionAttributeParser(publicKey, account)
    );
  }

  async createCollectionInstruction(
    applicationId: string,
    collectionId: string,
    instructionName: string
  ) {
    if (!this.writer) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const instruction = Keypair.generate();

    return this.writer.rpc.createCollectionInstruction(instructionName, {
      accounts: {
        application: new PublicKey(applicationId),
        collection: new PublicKey(collectionId),
        instruction: instruction.publicKey,
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [instruction],
    });
  }

  async getCollectionInstructions(
    collectionId: string
  ): Promise<CollectionInstruction[]> {
    if (!this.reader) {
      throw Error('Program is not available');
    }

    const programAccounts = await this.reader.account.collectionInstruction.all(
      [
        {
          memcmp: {
            bytes: collectionId,
            offset: 72,
          },
        },
      ]
    );

    return programAccounts.map(({ account, publicKey }) =>
      CollectionInstructionParser(publicKey, account)
    );
  }

  async getCollectionInstruction(
    instructionId: string
  ): Promise<CollectionInstruction | null> {
    if (!this.reader) {
      throw Error('Program is not available');
    }

    const account =
      await this.reader.account.collectionInstruction.fetchNullable(
        new PublicKey(instructionId)
      );

    return (
      account &&
      CollectionInstructionParser(new PublicKey(instructionId), account)
    );
  }

  async createCollectionInstructionArgument(
    applicationId: string,
    collectionId: string,
    instructionId: string,
    argumentName: string,
    argumentKind: number,
    argumentModifier: number,
    argumentSize: number
  ) {
    if (!this.writer) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const argument = Keypair.generate();

    return this.writer.rpc.createCollectionInstructionArgument(
      argumentName,
      argumentKind,
      argumentModifier,
      argumentSize,
      {
        accounts: {
          authority: this.writer.provider.wallet.publicKey,
          application: new PublicKey(applicationId),
          collection: new PublicKey(collectionId),
          instruction: new PublicKey(instructionId),
          argument: argument.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [argument],
      }
    );
  }

  async getCollectionInstructionArguments(
    instructionId: string
  ): Promise<InstructionArgument[]> {
    if (!this.reader) {
      throw Error('Program is not available');
    }

    const programAccounts = await this.reader.account.instructionArgument.all([
      {
        memcmp: {
          bytes: instructionId,
          offset: 104,
        },
      },
    ]);

    return programAccounts.map(({ account, publicKey }) =>
      InstructionArgumentParser(publicKey, account)
    );
  }

  async createCollectionInstructionAccount(
    applicationId: string,
    collectionId: string,
    instructionId: string,
    accountName: string,
    accountKind: number,
    accountCollectionId: string,
    accountMarkAttribute: number
  ) {
    if (!this.writer) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const account = Keypair.generate();

    return this.writer.rpc.createCollectionInstructionAccount(
      accountName,
      accountKind,
      accountMarkAttribute,
      {
        accounts: {
          authority: this.wallet.publicKey,
          application: new PublicKey(applicationId),
          collection: new PublicKey(collectionId),
          instruction: new PublicKey(instructionId),
          accountCollection: new PublicKey(accountCollectionId),
          account: account.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [account],
      }
    );
  }

  async getCollectionInstructionAccounts(
    instructionId: string
  ): Promise<InstructionAccount[]> {
    if (!this.reader) {
      throw Error('Program is not available');
    }

    const programAccounts = await this.reader.account.instructionAccount.all([
      {
        memcmp: {
          bytes: instructionId,
          offset: 104,
        },
      },
    ]);

    return programAccounts.map(({ account, publicKey }) =>
      InstructionAccountParser(publicKey, account)
    );
  }
}
