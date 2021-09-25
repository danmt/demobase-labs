import { Idl, Program, Provider } from '@project-serum/anchor';
import {
  Commitment,
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { encode } from 'bs58';

import * as idl from './idl.json';
import {
  AccountBoolAttribute,
  Application,
  Collection,
  CollectionAttribute,
  CollectionInstruction,
  CollectionInstructionArgument,
  InstructionAccount,
  Wallet,
} from './types';
import {
  AccountBoolAttributeParser,
  APPLICATION_DATA_SIZE,
  APPLICATION_NAME,
  ApplicationParser,
  COLLECTION_ATTRIBUTE_DATA_SIZE,
  COLLECTION_ATTRIBUTE_NAME,
  COLLECTION_DATA_SIZE,
  COLLECTION_INSTRUCTION_ACCOUNT_BOOL_ATTRIBUTE_DATA_SIZE,
  COLLECTION_INSTRUCTION_ACCOUNT_BOOL_ATTRIBUTE_NAME,
  COLLECTION_INSTRUCTION_ACCOUNT_DATA_SIZE,
  COLLECTION_INSTRUCTION_ACCOUNT_NAME,
  COLLECTION_INSTRUCTION_ARGUMENT_DATA_SIZE,
  COLLECTION_INSTRUCTION_ARGUMENT_NAME,
  COLLECTION_INSTRUCTION_DATA_SIZE,
  COLLECTION_INSTRUCTION_NAME,
  COLLECTION_NAME,
  CollectionAttributeParser,
  CollectionInstructionArgumentParser,
  CollectionInstructionParser,
  CollectionParser,
  DEMOBASE_PROGRAM_ID,
  findAccountBoolAttributeAddress,
  findCollectionAddress,
  findCollectionAttributeAddress,
  findCollectionInstructionAddress,
  findCollectionInstructionArgumentAddress,
  findInstructionAccountAddress,
  getAccountDiscriminator,
  InstructionAccountParser,
} from './utils';

export class DemobaseService {
  _program: Program | null = null;

  get programId() {
    return this._program ? this._program.programId : null;
  }

  get connection() {
    return this._program ? this._program.provider.connection : null;
  }

  get wallet() {
    return this._program ? this._program.provider.wallet : null;
  }

  setProgram(program: Program) {
    this._program = program;
  }

  setProgramFromConfig(
    connection: Connection,
    wallet: Wallet,
    opts?: ConfirmOptions
  ) {
    const provider = new Provider(
      connection,
      wallet,
      opts || Provider.defaultOptions()
    );
    const program = new Program(idl as Idl, DEMOBASE_PROGRAM_ID, provider);
    this.setProgram(program);
  }

  static create(connection: Connection, wallet: Wallet, opts?: ConfirmOptions) {
    const service = new DemobaseService();
    service.setProgramFromConfig(connection, wallet, opts);

    return service;
  }

  static fromProgram(program: Program) {
    const service = new DemobaseService();
    service.setProgram(program);

    return service;
  }

  async createApplication(applicationName: string) {
    if (!this._program) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

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

  async getApplications(commitment?: Commitment): Promise<Application[]> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const filters = [
      { dataSize: APPLICATION_DATA_SIZE },
      {
        memcmp: {
          bytes: encode(getAccountDiscriminator(APPLICATION_NAME)),
          offset: 0,
        },
      },
    ];

    const programAccounts = await this.connection.getProgramAccounts(
      DEMOBASE_PROGRAM_ID,
      {
        filters,
        commitment,
      }
    );

    return programAccounts.map(({ account, pubkey }) =>
      ApplicationParser(pubkey, account)
    );
  }

  async getApplication(
    applicationId: PublicKey,
    commitment?: Commitment
  ): Promise<Application | null> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const account = await this.connection.getAccountInfo(
      applicationId,
      commitment
    );

    return account && ApplicationParser(applicationId, account);
  }

  async createCollection(applicationId: PublicKey, collectionName: string) {
    if (!this._program) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const [collectionId, collectionBump] = await findCollectionAddress(
      applicationId,
      collectionName
    );

    return this._program.rpc.createCollection(collectionName, collectionBump, {
      accounts: {
        collection: collectionId,
        application: applicationId,
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
  }

  async getCollections(commitment?: Commitment): Promise<Collection[]> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const filters = [
      { dataSize: COLLECTION_DATA_SIZE },
      {
        memcmp: {
          bytes: encode(getAccountDiscriminator(COLLECTION_NAME)),
          offset: 0,
        },
      },
    ];

    const programAccounts = await this.connection.getProgramAccounts(
      DEMOBASE_PROGRAM_ID,
      {
        filters,
        commitment,
      }
    );

    return programAccounts.map(({ account, pubkey }) =>
      CollectionParser(pubkey, account)
    );
  }

  async getCollectionsByApplication(
    applicationId: PublicKey,
    commitment?: Commitment
  ): Promise<Collection[]> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const filters = [
      { dataSize: COLLECTION_DATA_SIZE },
      {
        memcmp: {
          bytes: encode(getAccountDiscriminator(COLLECTION_NAME)),
          offset: 0,
        },
      },
      {
        memcmp: {
          bytes: applicationId.toBase58(),
          offset: 41,
        },
      },
    ];

    const programAccounts = await this.connection.getProgramAccounts(
      DEMOBASE_PROGRAM_ID,
      {
        filters,
        commitment,
      }
    );

    return programAccounts.map(({ account, pubkey }) =>
      CollectionParser(pubkey, account)
    );
  }

  async getCollection(
    collectionId: PublicKey,
    commitment?: Commitment
  ): Promise<Collection | null> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const account = await this.connection.getAccountInfo(
      collectionId,
      commitment
    );

    return account && CollectionParser(collectionId, account);
  }

  async createCollectionAttribute(
    collectionId: PublicKey,
    name: string,
    attributeType: string,
    size: number
  ) {
    if (!this._program) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const [collectionAttributeId, collectionAttributeBump] =
      await findCollectionAttributeAddress(collectionId, name);

    return this._program.rpc.createCollectionAttribute(
      name,
      attributeType,
      size,
      collectionAttributeBump,
      {
        accounts: {
          collectionAttribute: collectionAttributeId,
          collection: collectionId,
          authority: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
  }

  async getCollectionAttributes(
    collectionId: PublicKey,
    commitment?: Commitment
  ): Promise<CollectionAttribute[]> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const filters = [
      { dataSize: COLLECTION_ATTRIBUTE_DATA_SIZE },
      {
        memcmp: {
          bytes: encode(getAccountDiscriminator(COLLECTION_ATTRIBUTE_NAME)),
          offset: 0,
        },
      },
      {
        memcmp: {
          bytes: collectionId.toBase58(),
          offset: 41,
        },
      },
    ];

    const programAccounts = await this.connection.getProgramAccounts(
      DEMOBASE_PROGRAM_ID,
      {
        filters,
        commitment,
      }
    );

    return programAccounts.map(({ account, pubkey }) =>
      CollectionAttributeParser(pubkey, account)
    );
  }

  async createCollectionInstruction(collectionId: PublicKey, name: string) {
    if (!this._program) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const [collectionInstructionId, collectionInstructionBump] =
      await findCollectionInstructionAddress(collectionId, name);

    return this._program.rpc.createCollectionInstruction(
      name,
      collectionInstructionBump,
      {
        accounts: {
          collectionInstruction: collectionInstructionId,
          collection: collectionId,
          authority: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
  }

  async getCollectionInstructions(
    collectionId: PublicKey,
    commitment?: Commitment
  ): Promise<CollectionInstruction[]> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const filters = [
      { dataSize: COLLECTION_INSTRUCTION_DATA_SIZE },
      {
        memcmp: {
          bytes: encode(getAccountDiscriminator(COLLECTION_INSTRUCTION_NAME)),
          offset: 0,
        },
      },
      {
        memcmp: {
          bytes: collectionId.toBase58(),
          offset: 41,
        },
      },
    ];

    const programAccounts = await this.connection.getProgramAccounts(
      DEMOBASE_PROGRAM_ID,
      {
        filters,
        commitment,
      }
    );

    return programAccounts.map(({ account, pubkey }) =>
      CollectionInstructionParser(pubkey, account)
    );
  }

  async getCollectionInstruction(
    instructionId: PublicKey,
    commitment?: Commitment
  ): Promise<CollectionInstruction | null> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const account = await this.connection.getAccountInfo(
      instructionId,
      commitment
    );

    return account && CollectionInstructionParser(instructionId, account);
  }

  async createCollectionInstructionArgument(
    instructionId: PublicKey,
    name: string,
    type: string
  ) {
    if (!this._program) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const [collectionInstructionArgumentId, collectionInstructionArgumentBump] =
      await findCollectionInstructionArgumentAddress(instructionId, name);

    return this._program.rpc.createCollectionInstructionArgument(
      name,
      type,
      collectionInstructionArgumentBump,
      {
        accounts: {
          collectionInstructionArgument: collectionInstructionArgumentId,
          collectionInstruction: instructionId,
          authority: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
  }

  async getCollectionInstructionArguments(
    instructionId: PublicKey,
    commitment?: Commitment
  ): Promise<CollectionInstructionArgument[]> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const filters = [
      { dataSize: COLLECTION_INSTRUCTION_ARGUMENT_DATA_SIZE },
      {
        memcmp: {
          bytes: encode(
            getAccountDiscriminator(COLLECTION_INSTRUCTION_ARGUMENT_NAME)
          ),
          offset: 0,
        },
      },
      {
        memcmp: {
          bytes: instructionId.toBase58(),
          offset: 41,
        },
      },
    ];

    const programAccounts = await this.connection.getProgramAccounts(
      DEMOBASE_PROGRAM_ID,
      {
        filters,
        commitment,
      }
    );

    return programAccounts.map(({ account, pubkey }) =>
      CollectionInstructionArgumentParser(pubkey, account)
    );
  }

  async createCollectionInstructionAccount(
    instructionId: PublicKey,
    name: string,
    kind: number,
    collectionId: PublicKey
  ) {
    if (!this._program) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const [accountId, accountBump] = await findInstructionAccountAddress(
      instructionId,
      name
    );

    return this._program.rpc.createCollectionInstructionAccount(
      name,
      kind,
      accountBump,
      {
        accounts: {
          account: accountId,
          instruction: instructionId,
          collection: collectionId,
          authority: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
  }

  async getCollectionInstructionAccounts(
    instructionId: PublicKey,
    commitment?: Commitment
  ): Promise<InstructionAccount[]> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const filters = [
      { dataSize: COLLECTION_INSTRUCTION_ACCOUNT_DATA_SIZE },
      {
        memcmp: {
          bytes: encode(
            getAccountDiscriminator(COLLECTION_INSTRUCTION_ACCOUNT_NAME)
          ),
          offset: 0,
        },
      },
      {
        memcmp: {
          bytes: instructionId.toBase58(),
          offset: 73,
        },
      },
    ];

    const programAccounts = await this.connection.getProgramAccounts(
      DEMOBASE_PROGRAM_ID,
      {
        filters,
        commitment,
      }
    );

    return programAccounts.map(({ account, pubkey }) =>
      InstructionAccountParser(pubkey, account)
    );
  }

  async createCollectionInstructionAccountBoolAttribute(
    accountId: PublicKey,
    instructionId: PublicKey,
    kind: number
  ) {
    if (!this._program) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const [attributeId, attributeBump] = await findAccountBoolAttributeAddress(
      accountId
    );

    return this._program.rpc.createAccountBoolAttribute(kind, attributeBump, {
      accounts: {
        instruction: instructionId,
        attribute: attributeId,
        account: accountId,
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
  }

  async updateCollectionInstructionAccountBoolAttribute(
    attributeId: PublicKey,
    kind: number
  ) {
    if (!this._program) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    return this._program.rpc.updateAccountBoolAttribute(kind, {
      accounts: {
        attribute: attributeId,
        authority: this.wallet.publicKey,
      },
    });
  }

  async deleteCollectionInstructionAccountBoolAttribute(
    attributeId: PublicKey
  ) {
    if (!this._program) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    return this._program.rpc.deleteAccountBoolAttribute({
      accounts: {
        attribute: attributeId,
        authority: this.wallet.publicKey,
      },
    });
  }

  async getCollectionInstructionBoolAttributes(
    instructionId: PublicKey,
    commitment?: Commitment
  ): Promise<AccountBoolAttribute[]> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const filters = [
      { dataSize: COLLECTION_INSTRUCTION_ACCOUNT_BOOL_ATTRIBUTE_DATA_SIZE },
      {
        memcmp: {
          bytes: encode(
            getAccountDiscriminator(
              COLLECTION_INSTRUCTION_ACCOUNT_BOOL_ATTRIBUTE_NAME
            )
          ),
          offset: 0,
        },
      },
      {
        memcmp: {
          bytes: instructionId.toBase58(),
          offset: 41,
        },
      },
    ];

    const programAccounts = await this.connection.getProgramAccounts(
      DEMOBASE_PROGRAM_ID,
      {
        filters,
        commitment,
      }
    );

    return programAccounts.map(({ account, pubkey }) =>
      AccountBoolAttributeParser(pubkey, account)
    );
  }
}
