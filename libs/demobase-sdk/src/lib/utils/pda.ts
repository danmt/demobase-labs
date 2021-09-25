import { PublicKey } from '@solana/web3.js';

import { DEMOBASE_PROGRAM_ID } from './constants';

export const findCollectionAddress = (
  applicationId: PublicKey,
  name: string
) => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('collection', 'utf8'),
      applicationId.toBuffer(),
      Buffer.from(name, 'utf-8'),
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
      applicationId.toBuffer(),
      Buffer.from(name, 'utf-8'),
      Uint8Array.from([bump]),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const findCollectionAttributeAddress = (
  applicationId: PublicKey,
  collectionId: PublicKey,
  name: string
) => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('collection_attribute', 'utf8'),
      applicationId.toBuffer(),
      collectionId.toBuffer(),
      Buffer.from(name, 'utf-8'),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const findCollectionInstructionAddress = (
  applicationId: PublicKey,
  collectionId: PublicKey,
  name: string
) => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('collection_instruction', 'utf8'),
      applicationId.toBuffer(),
      collectionId.toBuffer(),
      Buffer.from(name, 'utf-8'),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const createCollectionInstructionAddress = (
  applicationId: PublicKey,
  collectionId: PublicKey,
  name: string,
  bump: number
) => {
  return PublicKey.createProgramAddress(
    [
      Buffer.from('collection_instruction', 'utf8'),
      applicationId.toBuffer(),
      collectionId.toBuffer(),
      Buffer.from(name, 'utf-8'),
      Uint8Array.from([bump]),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const findCollectionInstructionArgumentAddress = (
  applicationId: PublicKey,
  collectionId: PublicKey,
  instructionId: PublicKey,
  name: string
) => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('instruction_argument', 'utf8'),
      applicationId.toBuffer(),
      collectionId.toBuffer(),
      instructionId.toBuffer(),
      Buffer.from(name, 'utf-8'),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const findInstructionAccountAddress = (
  applicationId: PublicKey,
  collectionId: PublicKey,
  instructionId: PublicKey,
  name: string
) => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('instruction_account', 'utf8'),
      applicationId.toBuffer(),
      collectionId.toBuffer(),
      instructionId.toBuffer(),
      Buffer.from(name, 'utf-8'),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const createInstructionAccountAddress = (
  applicationId: PublicKey,
  collectionId: PublicKey,
  instructionId: PublicKey,
  name: string,
  bump: number
) => {
  return PublicKey.createProgramAddress(
    [
      Buffer.from('instruction_account', 'utf8'),
      applicationId.toBuffer(),
      collectionId.toBuffer(),
      instructionId.toBuffer(),
      Buffer.from(name, 'utf-8'),
      Uint8Array.from([bump]),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const findAccountBoolAttributeAddress = (
  applicationId: PublicKey,
  collectionId: PublicKey,
  instructionId: PublicKey,
  accountId: PublicKey
) => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('account_bool_attribute', 'utf8'),
      applicationId.toBuffer(),
      collectionId.toBuffer(),
      instructionId.toBuffer(),
      accountId.toBuffer(),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const createAccountBoolAttributeAddress = (
  applicationId: PublicKey,
  collectionId: PublicKey,
  instructionId: PublicKey,
  accountId: PublicKey,
  bump: number
) => {
  return PublicKey.createProgramAddress(
    [
      Buffer.from('account_bool_attribute', 'utf8'),
      applicationId.toBuffer(),
      collectionId.toBuffer(),
      instructionId.toBuffer(),
      accountId.toBuffer(),
      Uint8Array.from([bump]),
    ],
    DEMOBASE_PROGRAM_ID
  );
};
