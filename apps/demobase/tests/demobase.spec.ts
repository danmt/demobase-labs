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
  const application = Keypair.generate();
  const instructionArgument = Keypair.generate();
  const instructionAccount = Keypair.generate();

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
    // act
    await program.rpc.createCollectionInstructionArgument(
      argumentName,
      argumentKind,
      argumentModifier,
      argumentSize,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: collectionId,
          instruction: instructionId,
          argument: instructionArgument.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instructionArgument],
      }
    );
    // assert
    const argumentAccount = await program.account.instructionArgument.fetch(
      instructionArgument.publicKey
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

  it('should update collection instruction argument', async () => {
    // arrange
    const argumentName = 'new-name';
    const argumentKind = 2;
    const argumentSize = 1;
    const argumentModifier = 2;
    // act
    await program.rpc.updateCollectionInstructionArgument(
      argumentName,
      argumentKind,
      argumentModifier,
      argumentSize,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          argument: instructionArgument.publicKey,
        },
      }
    );
    // assert
    const argumentAccount = await program.account.instructionArgument.fetch(
      instructionArgument.publicKey
    );
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          argumentAccount.name.filter((segment: number) => segment !== 0)
        )
      ),
      argumentName
    );
    assert.ok('u32' in argumentAccount.kind);
    assert.equal(argumentAccount.kind.u32.size, 4);
    assert.ok('vector' in argumentAccount.modifier);
    assert.equal(argumentAccount.modifier.vector.size, argumentSize);
  });

  it('should delete collection instruction argument', async () => {
    // act
    await program.rpc.deleteCollectionInstructionArgument({
      accounts: {
        authority: program.provider.wallet.publicKey,
        argument: instructionArgument.publicKey,
      },
    });
    // assert
    const argumentAccount =
      await program.account.instructionArgument.fetchNullable(
        instructionArgument.publicKey
      );
    assert.equal(argumentAccount, null);
  });

  it('should create collection instruction account', async () => {
    // arrange
    const instructionAccountName = 'data';
    const instructionAccountKind = 0;
    const instructionAccountMarkAttribute = 0;
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
    // act
    await program.rpc.createCollectionInstructionAccount(
      instructionAccountName,
      instructionAccountKind,
      instructionAccountMarkAttribute,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: collectionId,
          instruction: instructionId,
          accountCollection: collectionId,
          account: instructionAccount.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instructionAccount],
      }
    );
    // assert
    const account = await program.account.instructionAccount.fetch(
      instructionAccount.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment: number) => segment !== 0))
      ),
      instructionAccountName
    );
    assert.ok('account' in account.kind);
    assert.ok('none' in account.markAttribute);
    assert.ok(account.instruction.equals(instructionId));
    assert.ok(account.collection.equals(collectionId));
    assert.ok(account.application.equals(application.publicKey));
  });

  it('should update collection instruction account', async () => {
    // arrange
    const instructionAccountName = 'data-2';
    const instructionAccountKind = 1;
    const instructionAccountMarkAttribute = 1;
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    // act
    await program.rpc.updateCollectionInstructionAccount(
      instructionAccountName,
      instructionAccountKind,
      instructionAccountMarkAttribute,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          account: instructionAccount.publicKey,
          accountCollection: collectionId,
        },
      }
    );
    // assert
    const account = await program.account.instructionAccount.fetch(
      instructionAccount.publicKey
    );
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment: number) => segment !== 0))
      ),
      instructionAccountName
    );
    assert.ok('signer' in account.kind);
    assert.ok('init' in account.markAttribute);
  });

  it('should delete collection instruction account', async () => {
    // act
    await program.rpc.deleteCollectionInstructionAccount({
      accounts: {
        authority: program.provider.wallet.publicKey,
        account: instructionAccount.publicKey,
      },
    });
    // assert
    const account = await program.account.instructionAccount.fetchNullable(
      instructionAccount.publicKey
    );
    assert.equal(account, null);
  });
});
