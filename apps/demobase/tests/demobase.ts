import {
  BN,
  Provider,
  setProvider,
  utils,
  workspace,
} from '@project-serum/anchor';
import { SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

import {
  createApplicationAddress,
  createCollectionAddress,
  createDocumentAddress,
  findApplicationAddress,
  findCollectionAddress,
  findDocumentAddress,
} from './utils';

describe('demobase', () => {
  // Configure the client to use the local cluster.
  setProvider(Provider.env());
  const program = workspace.Demobase;
  let applicationBump: number, collectionBump: number, documentBump: number;
  const documentId = 'ABCD1234';
  const applicationName = 'myApp';

  it('should create application', async () => {
    // arrange
    const [application, bump] = await findApplicationAddress(applicationName);
    applicationBump = bump;
    // act
    await program.rpc.createApplication(applicationName, applicationBump, {
      accounts: {
        application,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const applicationAccount = await program.account.application.fetch(
      application
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
    const application = await createApplicationAddress(
      applicationName,
      applicationBump
    );
    const collectionName = 'things';
    const [collection, bump] = await findCollectionAddress(
      application,
      collectionName
    );
    collectionBump = bump;
    // act
    await program.rpc.createCollection(collectionName, bump, {
      accounts: {
        collection,
        application,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const applicationAccount = await program.account.application.fetch(
      application
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

  it('should create document', async () => {
    // arrange
    const application = await createApplicationAddress(
      applicationName,
      applicationBump
    );
    const collectionName = 'things';
    const collectionId = await createCollectionAddress(
      application,
      collectionName,
      collectionBump
    );
    const [document, bump] = await findDocumentAddress(
      application,
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
        application: application,
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
    const application = await createApplicationAddress(
      applicationName,
      applicationBump
    );
    const collectionName = 'things';
    const collectionId = await createCollectionAddress(
      application,
      collectionName,
      collectionBump
    );
    const document = await createDocumentAddress(
      application,
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
    const application = await createApplicationAddress(
      applicationName,
      applicationBump
    );
    const collectionName = 'things';
    const collectionId = await createCollectionAddress(
      application,
      collectionName,
      collectionBump
    );
    const document = await createDocumentAddress(
      application,
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
