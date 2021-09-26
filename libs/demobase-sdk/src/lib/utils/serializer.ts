import { utils } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

import {
  AccountBoolAttribute,
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
  bump: number;
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
      bump: account.bump,
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
  bump: number;
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
      bump: account.bump,
    },
  };
};

interface RawCollectionInstruction {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  name: Uint8Array;
  bump: number;
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
      bump: account.bump,
    },
  };
};

interface RawInstructionArgument {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  instruction: PublicKey;
  name: Uint8Array;
  kind: { [key: string]: unknown };
  modifier: { [key: string]: { size: number } };
  bump: number;
}

export const InstructionArgumentParser = (
  publicKey: PublicKey,
  account: RawInstructionArgument
): InstructionArgument => {
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
      modifier: {
        name: Object.keys(account.modifier)[0],
        size: Object.values(account.modifier)[0].size,
      },
      bump: account.bump,
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
  bump: number;
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
      bump: account.bump,
    },
  };
};

interface RawAccountBoolAttribute {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  instruction: PublicKey;
  account: PublicKey;
  kind: Uint8Array;
  bump: number;
}

export const AccountBoolAttributeParser = (
  publicKey: PublicKey,
  account: RawAccountBoolAttribute
): AccountBoolAttribute => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      collection: account.collection.toBase58(),
      instruction: account.instruction.toBase58(),
      account: account.account.toBase58(),
      kind: Object.keys(account.kind)[0],
      bump: account.bump,
    },
  };
};
