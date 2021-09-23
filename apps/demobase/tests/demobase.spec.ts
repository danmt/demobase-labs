import { Provider, setProvider, utils, workspace } from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

import {
  createCollectionAddress,
  createCollectionInstructionAddress,
  findCollectionAddress,
  findCollectionAttributeAddress,
  findCollectionInstructionAddress,
  findCollectionInstructionArgumentAddress,
} from './utils';

describe('demobase', () => {
  // Configure the client to use the local cluster.
  setProvider(Provider.env());
  const program = workspace.Demobase;
  let collectionBump: number, collectionInstructionBump: number;
  const applicationName = 'myApp';
  const collectionName = 'things';
  const collectionInstructionName = 'create_document';
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
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          collectionAttributeAccount.name.filter(
            (segment: number) => segment !== 0
          )
        )
      ),
      name
    );
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          collectionAttributeAccount.attributeType.filter(
            (segment: number) => segment !== 0
          )
        )
      ),
      attributeType
    );
    assert.equal(collectionAttributeAccount.size, size);
  });

  it('should create collection instruction', async () => {
    // arrange
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const [collectionInstructionId, bump] =
      await findCollectionInstructionAddress(
        collectionId,
        collectionInstructionName
      );
    collectionInstructionBump = bump;
    // act
    await program.rpc.createCollectionInstruction(
      collectionInstructionName,
      bump,
      {
        accounts: {
          collectionInstruction: collectionInstructionId,
          collection: collectionId,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
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
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          collectionInstructionAccount.name.filter(
            (segment: number) => segment !== 0
          )
        )
      ),
      collectionInstructionName
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
      collectionInstructionName,
      collectionInstructionBump
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
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          collectionInstructionArgumentAccount.name.filter(
            (segment: number) => segment !== 0
          )
        )
      ),
      collectionInstructionArgumentName
    );
    assert.equal(
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
});
