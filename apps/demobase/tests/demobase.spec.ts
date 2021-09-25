import { Provider, setProvider, utils, workspace } from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert, expect } from 'chai';

import {
  createAccountBoolAttributeAddress,
  createCollectionAddress,
  createCollectionInstructionAddress,
  createInstructionAccountAddress,
  findAccountBoolAttributeAddress,
  findCollectionAddress,
  findCollectionAttributeAddress,
  findCollectionInstructionAddress,
  findCollectionInstructionArgumentAddress,
  findInstructionAccountAddress,
} from './utils';

describe('demobase', () => {
  // Configure the client to use the local cluster.
  setProvider(Provider.env());
  const program = workspace.Demobase;
  let collectionBump: number,
    instructionBump: number,
    accountBump: number,
    accountBoolAttributeBump: number;
  const applicationName = 'myApp';
  const collectionName = 'things';
  const instructionName = 'create_document';
  const accountName = 'data';
  const application = Keypair.generate();

  it('should create application', async () => {
    // act
    await program.rpc.createApplication(applicationName, {
      accounts: {
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [application],
    });
    // assert
    const applicationAccount = await program.account.application.fetch(
      application.publicKey
    );
    assert.ok(
      applicationAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.strictEqual(
      utils.bytes.utf8.decode(
        new Uint8Array(
          applicationAccount.name.filter((segment: number) => segment !== 0)
        )
      ),
      applicationName
    );
  });

  it('should create collection', async () => {
    // arrange
    const [collection, bump] = await findCollectionAddress(
      application.publicKey,
      collectionName
    );
    collectionBump = bump;
    // act
    await program.rpc.createCollection(collectionName, bump, {
      accounts: {
        collection,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const collectionAccount = await program.account.collection.fetch(
      collection
    );
    assert.ok(
      collectionAccount.authority.equals(program.provider.wallet.publicKey)
    );
  });

  it('should create collection attribute', async () => {
    // arrange
    const name = 'attr1_name';
    const attributeType = '[u8; 32]';
    const size = 32;
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const [collectionAttributeId, bump] = await findCollectionAttributeAddress(
      collectionId,
      name
    );
    // act
    await program.rpc.createCollectionAttribute(
      name,
      attributeType,
      size,
      bump,
      {
        accounts: {
          collectionAttribute: collectionAttributeId,
          collection: collectionId,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
    // assert
    const collectionAttributeAccount =
      await program.account.collectionAttribute.fetch(collectionAttributeId);
    assert.ok(
      collectionAttributeAccount.authority.equals(
        program.provider.wallet.publicKey
      )
    );
    assert.strictEqual(
      utils.bytes.utf8.decode(
        new Uint8Array(
          collectionAttributeAccount.name.filter(
            (segment: number) => segment !== 0
          )
        )
      ),
      name
    );
    assert.strictEqual(
      utils.bytes.utf8.decode(
        new Uint8Array(
          collectionAttributeAccount.attributeType.filter(
            (segment: number) => segment !== 0
          )
        )
      ),
      attributeType
    );
    assert.strictEqual(collectionAttributeAccount.size, size);
  });

  it('should create collection instruction', async () => {
    // arrange
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const [collectionInstructionId, bump] =
      await findCollectionInstructionAddress(collectionId, instructionName);
    instructionBump = bump;
    // act
    await program.rpc.createCollectionInstruction(instructionName, bump, {
      accounts: {
        collectionInstruction: collectionInstructionId,
        collection: collectionId,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const collectionInstructionAccount =
      await program.account.collectionInstruction.fetch(
        collectionInstructionId
      );
    assert.ok(
      collectionInstructionAccount.authority.equals(
        program.provider.wallet.publicKey
      )
    );
    assert.strictEqual(
      utils.bytes.utf8.decode(
        new Uint8Array(
          collectionInstructionAccount.name.filter(
            (segment: number) => segment !== 0
          )
        )
      ),
      instructionName
    );
  });

  it('should create collection instruction argument', async () => {
    // arrange
    const collectionInstructionArgumentName = 'name';
    const collectionInstructionArgumentType = 'String';
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const collectionInstructionId = await createCollectionInstructionAddress(
      collectionId,
      instructionName,
      instructionBump
    );
    const [collectionInstructionArgumentId, bump] =
      await findCollectionInstructionArgumentAddress(
        collectionInstructionId,
        collectionInstructionArgumentName
      );
    // act
    await program.rpc.createCollectionInstructionArgument(
      collectionInstructionArgumentName,
      collectionInstructionArgumentType,
      bump,
      {
        accounts: {
          collectionInstructionArgument: collectionInstructionArgumentId,
          collectionInstruction: collectionInstructionId,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
    // assert
    const collectionInstructionArgumentAccount =
      await program.account.collectionInstructionArgument.fetch(
        collectionInstructionArgumentId
      );
    assert.ok(
      collectionInstructionArgumentAccount.authority.equals(
        program.provider.wallet.publicKey
      )
    );
    assert.strictEqual(
      utils.bytes.utf8.decode(
        new Uint8Array(
          collectionInstructionArgumentAccount.name.filter(
            (segment: number) => segment !== 0
          )
        )
      ),
      collectionInstructionArgumentName
    );
    assert.strictEqual(
      utils.bytes.utf8.decode(
        new Uint8Array(
          collectionInstructionArgumentAccount.argumentType.filter(
            (segment: number) => segment !== 0
          )
        )
      ),
      collectionInstructionArgumentType
    );
  });

  it('should create collection instruction account', async () => {
    // arrange
    const accountKind = 0;
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const instructionId = await createCollectionInstructionAddress(
      collectionId,
      instructionName,
      instructionBump
    );
    const [accountId, bump] = await findInstructionAccountAddress(
      instructionId,
      accountName
    );
    accountBump = bump;
    // act
    await program.rpc.createCollectionInstructionAccount(
      accountName,
      accountKind,
      bump,
      {
        accounts: {
          account: accountId,
          instruction: instructionId,
          collection: collectionId,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
    // assert
    const instructionAccount = await program.account.instructionAccount.fetch(
      accountId
    );
    assert.ok(
      instructionAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.strictEqual(
      utils.bytes.utf8.decode(
        new Uint8Array(
          instructionAccount.name.filter((segment: number) => segment !== 0)
        )
      ),
      accountName
    );
    assert.ok('account' in instructionAccount.kind);
    assert.ok(instructionAccount.instruction.equals(instructionId));
  });

  it('should create collection instruction account bool attribute', async () => {
    // arrange
    const accountBoolAttributeKind = 0;
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const instructionId = await createCollectionInstructionAddress(
      collectionId,
      instructionName,
      instructionBump
    );
    const accountId = await createInstructionAccountAddress(
      instructionId,
      accountName,
      accountBump
    );
    const [accountBoolAttributeId, bump] =
      await findAccountBoolAttributeAddress(accountId);
    accountBoolAttributeBump = bump;
    // act
    await program.rpc.createAccountBoolAttribute(
      accountBoolAttributeKind,
      bump,
      {
        accounts: {
          account: accountId,
          instruction: instructionId,
          attribute: accountBoolAttributeId,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
    // assert
    const attributeAccount = await program.account.accountBoolAttribute.fetch(
      accountBoolAttributeId
    );
    assert.ok('init' in attributeAccount.kind);
    assert.ok(
      attributeAccount.authority.equals(program.provider.wallet.publicKey)
    );
  });

  it('should update collection instruction account bool attribute', async () => {
    // arrange
    const accountBoolAttributeKind = 1;
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const instructionId = await createCollectionInstructionAddress(
      collectionId,
      instructionName,
      instructionBump
    );
    const accountId = await createInstructionAccountAddress(
      instructionId,
      accountName,
      accountBump
    );
    const accountBoolAttributeId = await createAccountBoolAttributeAddress(
      accountId,
      accountBoolAttributeBump
    );
    // act
    await program.rpc.updateAccountBoolAttribute(accountBoolAttributeKind, {
      accounts: {
        attribute: accountBoolAttributeId,
        authority: program.provider.wallet.publicKey,
      },
    });
    // assert
    const attributeAccount = await program.account.accountBoolAttribute.fetch(
      accountBoolAttributeId
    );
    assert.ok('mut' in attributeAccount.kind);
  });

  it('should delete collection instruction account bool attribute', async () => {
    // arrange
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const instructionId = await createCollectionInstructionAddress(
      collectionId,
      instructionName,
      instructionBump
    );
    const accountId = await createInstructionAccountAddress(
      instructionId,
      accountName,
      accountBump
    );
    const accountBoolAttributeId = await createAccountBoolAttributeAddress(
      accountId,
      accountBoolAttributeBump
    );
    // act
    await program.rpc.deleteAccountBoolAttribute({
      accounts: {
        attribute: accountBoolAttributeId,
        authority: program.provider.wallet.publicKey,
      },
    });
    // assert
    try {
      await program.account.accountBoolAttribute.fetch(accountBoolAttributeId);
    } catch (error) {
      assert.equal(error.name, 'Error');
      assert.equal(
        error.message,
        `Account does not exist ${accountBoolAttributeId.toBase58()}`
      );
    }
  });
});
