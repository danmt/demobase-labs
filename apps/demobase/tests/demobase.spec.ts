import {
  BN,
  Provider,
  setProvider,
  utils,
  workspace,
} from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

import {
  createCollectionAddress,
  createDocumentAddress,
  findCollectionAddress,
  findCollectionAttributeAddress,
  findCollectionInstructionAddress,
  findDocumentAddress,
} from './utils';

describe('demobase', () => {
  // Configure the client to use the local cluster.
  setProvider(Provider.env());
  const program = workspace.Demobase;
  let collectionBump: number, documentBump: number;
  const documentId = 'ABCD1234';
  const applicationName = 'myApp';
  const collectionName = 'things';
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
    assert.ok(applicationAccount.count.eq(new BN(0)));
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
    const applicationAccount = await program.account.application.fetch(
      application.publicKey
    );
    const collectionAccount = await program.account.collection.fetch(
      collection
    );
    assert.ok(applicationAccount.count.eq(new BN(1)));
    assert.ok(collectionAccount.count.eq(new BN(0)));
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
    const name = 'create_document';
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const [collectionInstructionId, bump] =
      await findCollectionInstructionAddress(collectionId, name);
    // act
    await program.rpc.createCollectionInstruction(name, bump, {
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
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          collectionInstructionAccount.name.filter(
            (segment: number) => segment !== 0
          )
        )
      ),
      name
    );
  });

  it('should create document', async () => {
    // arrange
    const collectionName = 'things';
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const [document, bump] = await findDocumentAddress(
      application.publicKey,
      collectionId,
      documentId
    );
    const content = 'sample content';
    documentBump = bump;
    // act
    await program.rpc.createDocument(documentId, content, documentBump, {
      accounts: {
        document,
        collection: collectionId,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const collectionAccount = await program.account.collection.fetch(
      collectionId
    );
    const documentAccount = await program.account.document.fetch(document);
    assert.ok(collectionAccount.count.eq(new BN(1)));
    assert.ok(
      documentAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          documentAccount.content.filter((segment: number) => segment !== 0)
        )
      ),
      content
    );
  });

  it('should update document', async () => {
    // arrange
    const collectionName = 'things';
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const document = await createDocumentAddress(
      application.publicKey,
      collectionId,
      documentId,
      documentBump
    );
    const content = 'updated sample content';
    // act
    await program.rpc.updateDocument(content, {
      accounts: {
        document,
        collection: collectionId,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const documentAccount = await program.account.document.fetch(document);
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          documentAccount.content.filter((segment: number) => segment !== 0)
        )
      ),
      content
    );
  });

  it('should delete document', async () => {
    // arrange
    const collectionName = 'things';
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const document = await createDocumentAddress(
      application.publicKey,
      collectionId,
      documentId,
      documentBump
    );
    // act
    await program.rpc.deleteDocument({
      accounts: {
        document,
        collection: collectionId,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const collectionAccount = await program.account.collection.fetch(
      collectionId
    );
    assert.ok(collectionAccount.count.eq(new BN(0)));
  });
});
