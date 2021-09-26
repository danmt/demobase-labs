import { Idl, Program, Provider } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';

import * as idl from './idl.json';
import {
  AccountBoolAttribute,
  Application,
  Collection,
  CollectionAttribute,
  CollectionInstruction,
  InstructionAccount,
  InstructionArgument,
  Wallet,
} from './types';
import {
  AccountBoolAttributeParser,
  ApplicationParser,
  CollectionAttributeParser,
  CollectionInstructionParser,
  CollectionParser,
  DEMOBASE_PROGRAM_ID,
  DummyWallet,
  findAccountBoolAttributeAddress,
  findCollectionAddress,
  findCollectionAttributeAddress,
  findCollectionInstructionAddress,
  findCollectionInstructionArgumentAddress,
  findInstructionAccountAddress,
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

    const [collectionId, collectionBump] = await findCollectionAddress(
      new PublicKey(applicationId),
      collectionName
    );

    return this.writer.rpc.createCollection(collectionName, collectionBump, {
      accounts: {
        collection: collectionId,
        application: new PublicKey(applicationId),
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
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

    const [attributeId, attributeBump] = await findCollectionAttributeAddress(
      new PublicKey(applicationId),
      new PublicKey(collectionId),
      attributeName
    );

    return this.writer.rpc.createCollectionAttribute(
      attributeName,
      attributeKind,
      attributeModifier,
      attributeSize,
      attributeBump,
      {
        accounts: {
          application: new PublicKey(applicationId),
          collection: new PublicKey(collectionId),
          attribute: attributeId,
          authority: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
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

    const [instructionId, instructionBump] =
      await findCollectionInstructionAddress(
        new PublicKey(applicationId),
        new PublicKey(collectionId),
        instructionName
      );

    return this.writer.rpc.createCollectionInstruction(
      instructionName,
      instructionBump,
      {
        accounts: {
          application: new PublicKey(applicationId),
          collection: new PublicKey(collectionId),
          instruction: instructionId,
          authority: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
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

    const [argumentId, argumentBump] =
      await findCollectionInstructionArgumentAddress(
        new PublicKey(applicationId),
        new PublicKey(collectionId),
        new PublicKey(instructionId),
        argumentName
      );

    return this.writer.rpc.createCollectionInstructionArgument(
      argumentName,
      argumentKind,
      argumentModifier,
      argumentSize,
      argumentBump,
      {
        accounts: {
          authority: this.writer.provider.wallet.publicKey,
          application: new PublicKey(applicationId),
          collection: new PublicKey(collectionId),
          instruction: new PublicKey(instructionId),
          argument: argumentId,
          systemProgram: SystemProgram.programId,
        },
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
    accountCollectionId: string
  ) {
    if (!this.writer) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const [accountId, accountBump] = await findInstructionAccountAddress(
      new PublicKey(applicationId),
      new PublicKey(collectionId),
      new PublicKey(instructionId),
      accountName
    );

    return this.writer.rpc.createCollectionInstructionAccount(
      accountName,
      accountKind,
      accountBump,
      {
        accounts: {
          authority: this.wallet.publicKey,
          application: new PublicKey(applicationId),
          collection: new PublicKey(collectionId),
          instruction: new PublicKey(instructionId),
          accountCollection: new PublicKey(accountCollectionId),
          account: accountId,
          systemProgram: SystemProgram.programId,
        },
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

  async createCollectionInstructionAccountBoolAttribute(
    applicationId: string,
    collectionId: string,
    instructionId: string,
    accountId: string,
    kind: number
  ) {
    if (!this.writer) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const [attributeId, attributeBump] = await findAccountBoolAttributeAddress(
      new PublicKey(applicationId),
      new PublicKey(collectionId),
      new PublicKey(instructionId),
      new PublicKey(accountId)
    );

    return this.writer.rpc.createAccountBoolAttribute(kind, attributeBump, {
      accounts: {
        authority: this.wallet.publicKey,
        application: new PublicKey(applicationId),
        collection: new PublicKey(collectionId),
        instruction: new PublicKey(instructionId),
        account: new PublicKey(accountId),
        attribute: attributeId,
        systemProgram: SystemProgram.programId,
      },
    });
  }

  async updateCollectionInstructionAccountBoolAttribute(
    attributeId: string,
    kind: number
  ) {
    if (!this.writer) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    return this.writer.rpc.updateAccountBoolAttribute(kind, {
      accounts: {
        authority: this.wallet.publicKey,
        attribute: attributeId,
      },
    });
  }

  async deleteCollectionInstructionAccountBoolAttribute(attributeId: string) {
    if (!this.writer) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    return this.writer.rpc.deleteAccountBoolAttribute({
      accounts: {
        authority: this.wallet.publicKey,
        attribute: attributeId,
      },
    });
  }

  async getCollectionInstructionBoolAttributes(
    instructionId: string
  ): Promise<AccountBoolAttribute[]> {
    if (!this.reader) {
      throw Error('Program is not available');
    }

    const programAccounts = await this.reader.account.accountBoolAttribute.all([
      {
        memcmp: {
          bytes: instructionId,
          offset: 104,
        },
      },
    ]);

    return programAccounts.map(({ account, publicKey }) =>
      AccountBoolAttributeParser(publicKey, account)
    );
  }
}
