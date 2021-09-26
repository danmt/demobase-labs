import { Provider, setProvider, utils, workspace } from '@project-serum/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

import {
  createCollectionAddress,
  findCollectionAddress,
  findCollectionAttributeAddress,
} from './utils';

describe('demobase', () => {
  // Configure the client to use the local cluster.
  setProvider(Provider.env());
  const program = workspace.Demobase;
  let collectionBump: number;
  const applicationName = 'myApp';
  const collectionName = 'things';
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
    const account = await program.account.collection.fetch(collection);
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
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
    const account = await program.account.collectionAttribute.fetch(
      attributeId
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment: number) => segment !== 0))
      ),
      attributeName
    );
    assert.ok('u8' in account.kind);
    assert.equal(account.kind.u8.size, 1);
    assert.ok('array' in account.modifier);
    assert.equal(account.modifier.array.size, attributeSize);
    assert.ok(account.collection.equals(collectionId));
    assert.ok(account.application.equals(application.publicKey));
  });

  describe('collection instruction', () => {
    const instruction = Keypair.generate();
    const instructionName = 'create_document';

    it('should create account', async () => {
      // arrange
      const collectionId = await createCollectionAddress(
        application.publicKey,
        collectionName,
        collectionBump
      );
      // act
      await program.rpc.createCollectionInstruction(instructionName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: collectionId,
          instruction: instruction.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instruction],
      });
      // assert
      const account = await program.account.collectionInstruction.fetch(
        instruction.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.equal(
        utils.bytes.utf8.decode(
          new Uint8Array(
            account.name.filter((segment: number) => segment !== 0)
          )
        ),
        instructionName
      );
      assert.ok(account.collection.equals(collectionId));
      assert.ok(account.application.equals(application.publicKey));
    });

    it('should update account', async () => {
      // arrange
      const instructionName = 'update_document';
      // act
      await program.rpc.updateCollectionInstruction(instructionName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          instruction: instruction.publicKey,
        },
      });
      // assert
      const account = await program.account.collectionInstruction.fetch(
        instruction.publicKey
      );
      assert.equal(
        utils.bytes.utf8.decode(
          new Uint8Array(
            account.name.filter((segment: number) => segment !== 0)
          )
        ),
        instructionName
      );
    });

    it('should delete account', async () => {
      // act
      await program.rpc.deleteCollectionInstruction({
        accounts: {
          authority: program.provider.wallet.publicKey,
          instruction: instruction.publicKey,
        },
      });
      // assert
      const account = await program.account.collectionInstruction.fetchNullable(
        instruction.publicKey
      );
      assert.equal(account, null);
    });
  });

  describe('collection instruction argument', () => {
    const instruction = Keypair.generate();
    const instructionArgument = Keypair.generate();
    const instructionName = 'create_document';
    let collectionId: PublicKey;

    before(async () => {
      collectionId = await createCollectionAddress(
        application.publicKey,
        collectionName,
        collectionBump
      );

      await program.rpc.createCollectionInstruction(instructionName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: collectionId,
          instruction: instruction.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instruction],
      });
    });

    it('should create account', async () => {
      // arrange
      const argumentName = 'name';
      const argumentKind = 1;
      const argumentSize = 32;
      const argumentModifier = 1;
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
            instruction: instruction.publicKey,
            argument: instructionArgument.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [instructionArgument],
        }
      );
      // assert
      const account = await program.account.instructionArgument.fetch(
        instructionArgument.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.equal(
        utils.bytes.utf8.decode(
          new Uint8Array(
            account.name.filter((segment: number) => segment !== 0)
          )
        ),
        argumentName
      );
      assert.ok('u16' in account.kind);
      assert.equal(account.kind.u16.size, 2);
      assert.ok('array' in account.modifier);
      assert.equal(account.modifier.array.size, argumentSize);
      assert.ok(account.instruction.equals(instruction.publicKey));
      assert.ok(account.collection.equals(collectionId));
      assert.ok(account.application.equals(application.publicKey));
    });

    it('should update account', async () => {
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
      const account = await program.account.instructionArgument.fetch(
        instructionArgument.publicKey
      );
      assert.equal(
        utils.bytes.utf8.decode(
          new Uint8Array(
            account.name.filter((segment: number) => segment !== 0)
          )
        ),
        argumentName
      );
      assert.ok('u32' in account.kind);
      assert.equal(account.kind.u32.size, 4);
      assert.ok('vector' in account.modifier);
      assert.equal(account.modifier.vector.size, argumentSize);
    });

    it('should delete account', async () => {
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
  });

  describe('collection instruction account', () => {
    const instruction = Keypair.generate();
    const instructionAccount = Keypair.generate();
    const instructionName = 'create_document';
    let collectionId: PublicKey;

    before(async () => {
      collectionId = await createCollectionAddress(
        application.publicKey,
        collectionName,
        collectionBump
      );

      await program.rpc.createCollectionInstruction(instructionName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: collectionId,
          instruction: instruction.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instruction],
      });
    });

    it('should create account', async () => {
      // arrange
      const instructionAccountName = 'data';
      const instructionAccountKind = 0;
      const instructionAccountMarkAttribute = 0;
      const collectionId = await createCollectionAddress(
        application.publicKey,
        collectionName,
        collectionBump
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
            instruction: instruction.publicKey,
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
          new Uint8Array(
            account.name.filter((segment: number) => segment !== 0)
          )
        ),
        instructionAccountName
      );
      assert.ok('account' in account.kind);
      assert.ok('none' in account.markAttribute);
      assert.ok(account.instruction.equals(instruction.publicKey));
      assert.ok(account.collection.equals(collectionId));
      assert.ok(account.application.equals(application.publicKey));
    });

    it('should update account', async () => {
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
          new Uint8Array(
            account.name.filter((segment: number) => segment !== 0)
          )
        ),
        instructionAccountName
      );
      assert.ok('signer' in account.kind);
      assert.ok('init' in account.markAttribute);
    });

    it('should delete account', async () => {
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
});
