import { PublicKey } from '@solana/web3.js';

import { DEMOBASE_PROGRAM_ID } from './constants';

export const findApplicationAddress = (name: string) => {
  return PublicKey.findProgramAddress(
    [Buffer.from('application', 'utf8'), Buffer.from(name, 'utf-8')],
    DEMOBASE_PROGRAM_ID
  );
};

export const createApplicationAddress = (name: string, bump: number) => {
  return PublicKey.createProgramAddress(
    [
      Buffer.from('application', 'utf-8'),
      Buffer.from(name, 'utf-8'),
      Uint8Array.from([bump]),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const findCollectionAddress = (
  applicationId: PublicKey,
  name: string
) => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('collection', 'utf8'),
      Buffer.from(name, 'utf-8'),
      applicationId.toBuffer(),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const createCollectionAddress = (
  applicationId: PublicKey,
  name: string,
  bump: number
) => {
  return PublicKey.createProgramAddress(
    [
      Buffer.from('collection', 'utf-8'),
      Buffer.from(name, 'utf-8'),
      applicationId.toBuffer(),
      Uint8Array.from([bump]),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const findDocumentAddress = (
  applicationId: PublicKey,
  collectionId: PublicKey,
  documentId: string
) => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('document', 'utf8'),
      Buffer.from(documentId, 'utf-8'),
      applicationId.toBuffer(),
      collectionId.toBuffer(),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const createDocumentAddress = (
  applicationId: PublicKey,
  collectionId: PublicKey,
  documentId: string,
  bump: number
) => {
  return PublicKey.createProgramAddress(
    [
      Buffer.from('document', 'utf-8'),
      Buffer.from(documentId, 'utf-8'),
      applicationId.toBuffer(),
      collectionId.toBuffer(),
      Uint8Array.from([bump]),
    ],
    DEMOBASE_PROGRAM_ID
  );
};
