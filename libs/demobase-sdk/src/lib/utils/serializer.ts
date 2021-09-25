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
  name: Uint8Array;
  authority: PublicKey;
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
  name: Uint8Array;
  authority: PublicKey;
  application: PublicKey;
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
      bump: rawCollection.bump,
      name: utils.bytes.utf8.decode(
        new Uint8Array(rawCollection.name.filter((segment) => segment !== 0))
      ),
      authority: rawCollection.authority,
      application: rawCollection.application,
    },
    account,
  };
};

interface RawCollectionAttribute {
  authority: PublicKey;
  bump: number;
  collection: PublicKey;
  name: Uint8Array;
  attributeType: Uint8Array;
  size: number;
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
      bump: rawCollectionAttribute.bump,
      size: rawCollectionAttribute.size,
      attributeType: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionAttribute.attributeType.filter(
            (segment) => segment !== 0
          )
        )
      ),
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionAttribute.name.filter((segment) => segment !== 0)
        )
      ),
      authority: rawCollectionAttribute.authority,
      collection: rawCollectionAttribute.collection,
    },
    account,
  };
};

interface RawCollectionInstruction {
  authority: PublicKey;
  bump: number;
  collection: PublicKey;
  name: Uint8Array;
  attributeType: Uint8Array;
  size: number;
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
      bump: rawCollectionInstruction.bump,
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionInstruction.name.filter((segment) => segment !== 0)
        )
      ),
      authority: rawCollectionInstruction.authority,
      collection: rawCollectionInstruction.collection,
    },
    account,
  };
};

interface RawCollectionInstructionArgument {
  authority: PublicKey;
  bump: number;
  collection: PublicKey;
  name: Uint8Array;
  argumentType: Uint8Array;
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
      bump: rawCollectionInstructionArgument.bump,
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionInstructionArgument.name.filter(
            (segment) => segment !== 0
          )
        )
      ),
      argumentType: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionInstructionArgument.argumentType.filter(
            (segment) => segment !== 0
          )
        )
      ),
      authority: rawCollectionInstructionArgument.authority,
      collection: rawCollectionInstructionArgument.collection,
    },
    account,
  };
};

interface RawInstructionAccount {
  authority: PublicKey;
  bump: number;
  instruction: PublicKey;
  collection: PublicKey;
  name: Uint8Array;
  kind: { [key: string]: unknown };
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
      collection: rawInstructionAccount.collection,
      bump: rawInstructionAccount.bump,
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawInstructionAccount.name.filter((segment) => segment !== 0)
        )
      ),
      kind: Object.keys(rawInstructionAccount.kind)[0],
      authority: rawInstructionAccount.authority,
      instruction: rawInstructionAccount.instruction,
    },
    account,
  };
};

interface RawAccountBoolAttribute {
  authority: PublicKey;
  bump: number;
  account: PublicKey;
  instruction: PublicKey;
  kind: Uint8Array;
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
      instruction: rawAccountBoolAttribute.instruction,
      bump: rawAccountBoolAttribute.bump,
      kind: Object.keys(rawAccountBoolAttribute.kind)[0],
      authority: rawAccountBoolAttribute.authority,
      account: rawAccountBoolAttribute.account,
    },
    account,
  };
};
