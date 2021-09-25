import { Provider, setProvider, utils, workspace } from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

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
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
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
    assert.equal(
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
    const attributeName = 'attr1_name';
    const attributeKind = 0;
    const attributeModifier = 1;
    const attributeSize = 32;
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const [attributeId, bump] = await findCollectionAttributeAddress(
      application.publicKey,
      collectionId,
      attributeName
    );
    // act
    await program.rpc.createCollectionAttribute(
      attributeName,
      attributeKind,
      attributeModifier,
      attributeSize,
      bump,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: collectionId,
          attribute: attributeId,
          systemProgram: SystemProgram.programId,
        },
      }
    );
    // assert
    const attributeAccount = await program.account.collectionAttribute.fetch(
      attributeId
    );
    assert.ok(
      attributeAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          attributeAccount.name.filter((segment: number) => segment !== 0)
        )
      ),
      attributeName
    );
    assert.ok('u8' in attributeAccount.kind);
    assert.equal(attributeAccount.kind.u8.size, 1);
    assert.ok('array' in attributeAccount.modifier);
    assert.equal(attributeAccount.modifier.array.size, attributeSize);
    assert.ok(attributeAccount.collection.equals(collectionId));
    assert.ok(attributeAccount.application.equals(application.publicKey));
  });

  it('should create collection instruction', async () => {
    // arrange
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const [instructionId, bump] = await findCollectionInstructionAddress(
      application.publicKey,
      collectionId,
      instructionName
    );
    instructionBump = bump;
    // act
    await program.rpc.createCollectionInstruction(instructionName, bump, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        collection: collectionId,
        instruction: instructionId,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const instructionAccount =
      await program.account.collectionInstruction.fetch(instructionId);
    assert.ok(
      instructionAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          instructionAccount.name.filter((segment: number) => segment !== 0)
        )
      ),
      instructionName
    );
    assert.ok(instructionAccount.collection.equals(collectionId));
    assert.ok(instructionAccount.application.equals(application.publicKey));
  });

  it('should create collection instruction argument', async () => {
    // arrange
    const argumentName = 'name';
    const argumentKind = 1;
    const argumentSize = 32;
    const argumentModifier = 1;
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const instructionId = await createCollectionInstructionAddress(
      application.publicKey,
      collectionId,
      instructionName,
      instructionBump
    );
    const [argumentId, bump] = await findCollectionInstructionArgumentAddress(
      application.publicKey,
      collectionId,
      instructionId,
      argumentName
    );
    // act
    await program.rpc.createCollectionInstructionArgument(
      argumentName,
      argumentKind,
      argumentModifier,
      argumentSize,
      bump,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: collectionId,
          instruction: instructionId,
          argument: argumentId,
          systemProgram: SystemProgram.programId,
        },
      }
    );
    // assert
    const argumentAccount = await program.account.instructionArgument.fetch(
      argumentId
    );
    assert.ok(
      argumentAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          argumentAccount.name.filter((segment: number) => segment !== 0)
        )
      ),
      argumentName
    );
    assert.ok('u16' in argumentAccount.kind);
    assert.equal(argumentAccount.kind.u16.size, 2);
    assert.ok('array' in argumentAccount.modifier);
    assert.equal(argumentAccount.modifier.array.size, argumentSize);
    assert.ok(argumentAccount.instruction.equals(instructionId));
    assert.ok(argumentAccount.collection.equals(collectionId));
    assert.ok(argumentAccount.application.equals(application.publicKey));
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
      application.publicKey,
      collectionId,
      instructionName,
      instructionBump
    );
    const [accountId, bump] = await findInstructionAccountAddress(
      application.publicKey,
      collectionId,
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
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: collectionId,
          instruction: instructionId,
          account: accountId,
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
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          instructionAccount.name.filter((segment: number) => segment !== 0)
        )
      ),
      accountName
    );
    assert.ok('account' in instructionAccount.kind);
    assert.ok(instructionAccount.instruction.equals(instructionId));
    assert.ok(instructionAccount.collection.equals(collectionId));
    assert.ok(instructionAccount.application.equals(application.publicKey));
  });

  it('should create collection instruction account bool attribute', async () => {
    // arrange
    const attributeKind = 0;
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const instructionId = await createCollectionInstructionAddress(
      application.publicKey,
      collectionId,
      instructionName,
      instructionBump
    );
    const accountId = await createInstructionAccountAddress(
      application.publicKey,
      collectionId,
      instructionId,
      accountName,
      accountBump
    );
    const [attributeId, bump] = await findAccountBoolAttributeAddress(
      application.publicKey,
      collectionId,
      instructionId,
      accountId
    );
    accountBoolAttributeBump = bump;
    // act
    await program.rpc.createAccountBoolAttribute(attributeKind, bump, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        collection: collectionId,
        instruction: instructionId,
        account: accountId,
        attribute: attributeId,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const attributeAccount = await program.account.accountBoolAttribute.fetch(
      attributeId
    );
    assert.ok('init' in attributeAccount.kind);
    assert.ok(
      attributeAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.ok(attributeAccount.account.equals(accountId));
    assert.ok(attributeAccount.instruction.equals(instructionId));
    assert.ok(attributeAccount.collection.equals(collectionId));
    assert.ok(attributeAccount.application.equals(application.publicKey));
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
      application.publicKey,
      collectionId,
      instructionName,
      instructionBump
    );
    const accountId = await createInstructionAccountAddress(
      application.publicKey,
      collectionId,
      instructionId,
      accountName,
      accountBump
    );
    const accountBoolAttributeId = await createAccountBoolAttributeAddress(
      application.publicKey,
      collectionId,
      instructionId,
      accountId,
      accountBoolAttributeBump
    );
    // act
    await program.rpc.updateAccountBoolAttribute(accountBoolAttributeKind, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        attribute: accountBoolAttributeId,
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
      application.publicKey,
      collectionId,
      instructionName,
      instructionBump
    );
    const accountId = await createInstructionAccountAddress(
      application.publicKey,
      collectionId,
      instructionId,
      accountName,
      accountBump
    );
    const attributeId = await createAccountBoolAttributeAddress(
      application.publicKey,
      collectionId,
      instructionId,
      accountId,
      accountBoolAttributeBump
    );
    // act
    await program.rpc.deleteAccountBoolAttribute({
      accounts: {
        authority: program.provider.wallet.publicKey,
        attribute: attributeId,
      },
    });
    // assert
    const attributeAccount =
      await program.account.accountBoolAttribute.fetchNullable(attributeId);
    assert.equal(attributeAccount, null);
  });
});
