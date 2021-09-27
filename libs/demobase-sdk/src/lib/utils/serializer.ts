import { utils } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

import {
  Application,
  Collection,
  CollectionAttribute,
  CollectionInstruction,
  InstructionAccount,
  InstructionArgument,
} from '../types';

interface RawApplication {
  authority: PublicKey;
  name: Uint8Array;
}

export const ApplicationParser = (
  publicKey: PublicKey,
  account: RawApplication
): Application => {
  return {
    id: publicKey.toBase58(),
    data: {
      name: utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment) => segment !== 0))
      ),
      authority: account.authority.toBase58(),
    },
  };
};

interface RawCollection {
  authority: PublicKey;
  application: PublicKey;
  name: Uint8Array;
}

export const CollectionParser = (
  publicKey: PublicKey,
  account: RawCollection
): Collection => {
  return {
    id: publicKey.toBase58(),
    data: {
      application: account.application.toBase58(),
      authority: account.authority.toBase58(),
      name: utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment) => segment !== 0))
      ),
    },
  };
};

interface RawCollectionAttribute {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  name: Uint8Array;
  kind: { [key: string]: { size: number } };
  modifier: { [key: string]: { size: number } };
}

export const CollectionAttributeParser = (
  publicKey: PublicKey,
  account: RawCollectionAttribute
): CollectionAttribute => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      collection: account.collection.toBase58(),
      name: utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment) => segment !== 0))
      ),
      kind: {
        name: Object.keys(account.kind)[0],
        size: Object.values(account.kind)[0].size,
      },
      modifier: {
        name: Object.keys(account.modifier)[0],
        size: Object.values(account.modifier)[0].size,
      },
    },
  };
};

interface RawCollectionInstruction {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  name: Uint8Array;
}

export const CollectionInstructionParser = (
  publicKey: PublicKey,
  account: RawCollectionInstruction
): CollectionInstruction => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      collection: account.collection.toBase58(),
      name: utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment) => segment !== 0))
      ),
    },
  };
};

interface RawInstructionArgument {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  instruction: PublicKey;
  name: Uint8Array;
  kind: { [key: string]: { id: number; size: number } };
  modifier: { [key: string]: { id: number; size: number } };
}

export const InstructionArgumentParser = (
  publicKey: PublicKey,
  account: RawInstructionArgument
): InstructionArgument => {
  console.log(account);
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      collection: account.collection.toBase58(),
      instruction: account.instruction.toBase58(),
      name: utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment) => segment !== 0))
      ),
      kind: {
        id: Object.values(account.kind)[0].id,
        name: Object.keys(account.kind)[0],
        size: Object.values(account.kind)[0].size,
      },
      modifier: {
        id: Object.values(account.modifier)[0].id,
        name: Object.keys(account.modifier)[0],
        size: Object.values(account.modifier)[0].size,
      },
    },
  };
};

interface RawInstructionAccount {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  instruction: PublicKey;
  name: Uint8Array;
  kind: { [key: string]: unknown };
  markAttribute: { [key: string]: unknown };
}

export const InstructionAccountParser = (
  publicKey: PublicKey,
  account: RawInstructionAccount
): InstructionAccount => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      collection: account.collection.toBase58(),
      instruction: account.instruction.toBase58(),
      name: utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment) => segment !== 0))
      ),
      kind: Object.keys(account.kind)[0],
      markAttribute: Object.keys(account.markAttribute)[0],
    },
  };
};
