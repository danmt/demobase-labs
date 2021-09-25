import { AccountsCoder, Idl, utils } from '@project-serum/anchor';
import { AccountInfo, PublicKey } from '@solana/web3.js';

import {
  APPLICATION_NAME,
  COLLECTION_NAME,
  COLLECTION_ATTRIBUTE_NAME,
  COLLECTION_INSTRUCTION_NAME,
  COLLECTION_INSTRUCTION_ARGUMENT_NAME,
  COLLECTION_INSTRUCTION_ACCOUNT_NAME,
  COLLECTION_INSTRUCTION_ACCOUNT_BOOL_ATTRIBUTE_NAME,
} from '.';
import * as idl from '../idl.json';
import {
  AccountBoolAttribute,
  Application,
  Collection,
  CollectionAttribute,
  CollectionInstruction,
  CollectionInstructionArgument,
  InstructionAccount,
} from '../types';

const accountCoder = new AccountsCoder(idl as Idl);

interface RawApplication {
  authority: PublicKey;
  name: Uint8Array;
}

export const ApplicationParser = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): Application => {
  const rawApplication = accountCoder.decode(
    APPLICATION_NAME,
    account.data
  ) as RawApplication;

  return {
    pubkey: publicKey,
    info: {
      name: utils.bytes.utf8.decode(
        new Uint8Array(rawApplication.name.filter((segment) => segment !== 0))
      ),
      authority: rawApplication.authority,
    },
    account,
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
  account: AccountInfo<Buffer>
): Collection => {
  const rawCollection = accountCoder.decode(
    COLLECTION_NAME,
    account.data
  ) as RawCollection;

  return {
    pubkey: publicKey,
    info: {
      application: rawCollection.application,
      authority: rawCollection.authority,
      name: utils.bytes.utf8.decode(
        new Uint8Array(rawCollection.name.filter((segment) => segment !== 0))
      ),
      bump: rawCollection.bump,
    },
    account,
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
  account: AccountInfo<Buffer>
): CollectionAttribute => {
  const rawCollectionAttribute = accountCoder.decode(
    COLLECTION_ATTRIBUTE_NAME,
    account.data
  ) as RawCollectionAttribute;

  return {
    pubkey: publicKey,
    info: {
      authority: rawCollectionAttribute.authority,
      application: rawCollectionAttribute.application,
      collection: rawCollectionAttribute.collection,
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionAttribute.name.filter((segment) => segment !== 0)
        )
      ),
      kind: {
        name: Object.keys(rawCollectionAttribute.kind)[0],
        size: Object.values(rawCollectionAttribute.kind)[0].size,
      },
      modifier: {
        name: Object.keys(rawCollectionAttribute.modifier)[0],
        size: Object.values(rawCollectionAttribute.modifier)[0].size,
      },
      bump: rawCollectionAttribute.bump,
    },
    account,
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
  account: AccountInfo<Buffer>
): CollectionInstruction => {
  const rawCollectionInstruction = accountCoder.decode(
    COLLECTION_INSTRUCTION_NAME,
    account.data
  ) as RawCollectionInstruction;

  return {
    pubkey: publicKey,
    info: {
      authority: rawCollectionInstruction.authority,
      application: rawCollectionInstruction.application,
      collection: rawCollectionInstruction.collection,
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionInstruction.name.filter((segment) => segment !== 0)
        )
      ),
      bump: rawCollectionInstruction.bump,
    },
    account,
  };
};

interface RawCollectionInstructionArgument {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  instruction: PublicKey;
  name: Uint8Array;
  kind: { [key: string]: unknown };
  modifier: { [key: string]: { size: number } };
  bump: number;
}

export const CollectionInstructionArgumentParser = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): CollectionInstructionArgument => {
  const rawCollectionInstructionArgument = accountCoder.decode(
    COLLECTION_INSTRUCTION_ARGUMENT_NAME,
    account.data
  ) as RawCollectionInstructionArgument;

  return {
    pubkey: publicKey,
    info: {
      authority: rawCollectionInstructionArgument.authority,
      application: rawCollectionInstructionArgument.application,
      collection: rawCollectionInstructionArgument.collection,
      instruction: rawCollectionInstructionArgument.instruction,
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionInstructionArgument.name.filter(
            (segment) => segment !== 0
          )
        )
      ),
      kind: Object.keys(rawCollectionInstructionArgument.kind)[0],
      modifier: {
        name: Object.keys(rawCollectionInstructionArgument.modifier)[0],
        size: Object.values(rawCollectionInstructionArgument.modifier)[0].size,
      },
      bump: rawCollectionInstructionArgument.bump,
    },
    account,
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
  account: AccountInfo<Buffer>
): InstructionAccount => {
  const rawInstructionAccount = accountCoder.decode(
    COLLECTION_INSTRUCTION_ACCOUNT_NAME,
    account.data
  ) as RawInstructionAccount;

  return {
    pubkey: publicKey,
    info: {
      authority: rawInstructionAccount.authority,
      application: rawInstructionAccount.application,
      collection: rawInstructionAccount.collection,
      instruction: rawInstructionAccount.instruction,
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawInstructionAccount.name.filter((segment) => segment !== 0)
        )
      ),
      kind: Object.keys(rawInstructionAccount.kind)[0],
      bump: rawInstructionAccount.bump,
    },
    account,
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
  account: AccountInfo<Buffer>
): AccountBoolAttribute => {
  const rawAccountBoolAttribute = accountCoder.decode(
    COLLECTION_INSTRUCTION_ACCOUNT_BOOL_ATTRIBUTE_NAME,
    account.data
  ) as RawAccountBoolAttribute;

  return {
    pubkey: publicKey,
    info: {
      authority: rawAccountBoolAttribute.authority,
      application: rawAccountBoolAttribute.application,
      collection: rawAccountBoolAttribute.collection,
      instruction: rawAccountBoolAttribute.instruction,
      account: rawAccountBoolAttribute.account,
      kind: Object.keys(rawAccountBoolAttribute.kind)[0],
      bump: rawAccountBoolAttribute.bump,
    },
    account,
  };
};
