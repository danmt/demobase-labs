import { utils } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

import {
  Application,
  Collection,
  CollectionAttribute,
  Instruction,
  InstructionArgument,
  InstructionBasicAccount,
  InstructionProgramAccount,
  InstructionSignerAccount,
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
  kind: { [key: string]: { id: number; name: string; size: number } };
  modifier: { [key: string]: { id: number; name: string; size: number } };
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

interface RawInstruction {
  authority: PublicKey;
  application: PublicKey;
  name: Uint8Array;
}

export const InstructionParser = (
  publicKey: PublicKey,
  account: RawInstruction
): Instruction => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      name: utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment) => segment !== 0))
      ),
    },
  };
};

interface RawInstructionArgument {
  authority: PublicKey;
  application: PublicKey;
  instruction: PublicKey;
  name: Uint8Array;
  kind: { [key: string]: { id: number; name: string; size: number } };
  modifier: { [key: string]: { id: number; name: string; size: number } };
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

interface RawInstructionBasicAccount {
  authority: PublicKey;
  application: PublicKey;
  instruction: PublicKey;
  name: Uint8Array;
  collection: PublicKey;
  markAttribute: { [key: string]: { id: number; name: string } };
}

export const InstructionBasicAccountParser = (
  publicKey: PublicKey,
  account: RawInstructionBasicAccount
): InstructionBasicAccount => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      instruction: account.instruction.toBase58(),
      name: utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment) => segment !== 0))
      ),
      collection: account.collection.toBase58(),
      markAttribute: {
        id: Object.values(account.markAttribute)[0].id,
        name: Object.keys(account.markAttribute)[0],
      },
    },
  };
};

interface RawInstructionSignerAccount {
  authority: PublicKey;
  application: PublicKey;
  instruction: PublicKey;
  name: Uint8Array;
  markAttribute: { [key: string]: { id: number; name: string } };
}

export const InstructionSignerAccountParser = (
  publicKey: PublicKey,
  account: RawInstructionSignerAccount
): InstructionSignerAccount => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      instruction: account.instruction.toBase58(),
      name: utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment) => segment !== 0))
      ),
      markAttribute: {
        id: Object.values(account.markAttribute)[0].id,
        name: Object.keys(account.markAttribute)[0],
      },
    },
  };
};

interface RawInstructionProgramAccount {
  authority: PublicKey;
  application: PublicKey;
  instruction: PublicKey;
  name: Uint8Array;
  program: PublicKey;
}

export const InstructionProgramAccountParser = (
  publicKey: PublicKey,
  account: RawInstructionProgramAccount
): InstructionProgramAccount => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      instruction: account.instruction.toBase58(),
      name: utils.bytes.utf8.decode(
        new Uint8Array(account.name.filter((segment) => segment !== 0))
      ),
      program: account.program.toBase58(),
    },
  };
};
