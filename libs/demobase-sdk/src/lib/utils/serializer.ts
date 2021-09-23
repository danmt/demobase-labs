import { AccountsCoder, Idl, utils } from '@project-serum/anchor';
import { AccountInfo, PublicKey } from '@solana/web3.js';

import {
  APPLICATION_ACCOUNT_NAME,
  COLLECTION_ACCOUNT_NAME,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
  COLLECTION_INSTRUCTION_ACCOUNT_NAME,
  COLLECTION_INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
} from '.';
import * as idl from '../idl.json';
import {
  ApplicationAccount,
  CollectionAccount,
  CollectionAttributeAccount,
  CollectionInstructionAccount,
  CollectionInstructionArgumentAccount,
} from '../types';

const accountCoder = new AccountsCoder(idl as Idl);

interface RawApplicationAccount {
  count: number;
  name: Uint8Array;
  authority: PublicKey;
}

export const ApplicationAccountParser = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): ApplicationAccount => {
  const rawApplicationAccount = accountCoder.decode(
    APPLICATION_ACCOUNT_NAME,
    account.data
  ) as RawApplicationAccount;

  return {
    pubkey: publicKey,
    info: {
      count: rawApplicationAccount.count,
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawApplicationAccount.name.filter((segment) => segment !== 0)
        )
      ),
      authority: rawApplicationAccount.authority,
    },
    account,
  };
};

interface RawCollectionAccount {
  count: number;
  name: Uint8Array;
  authority: PublicKey;
  application: PublicKey;
  bump: number;
}

export const CollectionAccountParser = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): CollectionAccount => {
  const rawCollectionAccount = accountCoder.decode(
    COLLECTION_ACCOUNT_NAME,
    account.data
  ) as RawCollectionAccount;

  return {
    pubkey: publicKey,
    info: {
      bump: rawCollectionAccount.bump,
      count: rawCollectionAccount.count,
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionAccount.name.filter((segment) => segment !== 0)
        )
      ),
      authority: rawCollectionAccount.authority,
      application: rawCollectionAccount.application,
    },
    account,
  };
};

interface RawCollectionAttributeAccount {
  authority: PublicKey;
  bump: number;
  collection: PublicKey;
  name: Uint8Array;
  attributeType: Uint8Array;
  size: number;
}

export const CollectionAttributeAccountParser = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): CollectionAttributeAccount => {
  const rawCollectionAttributeAccount = accountCoder.decode(
    COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
    account.data
  ) as RawCollectionAttributeAccount;

  return {
    pubkey: publicKey,
    info: {
      bump: rawCollectionAttributeAccount.bump,
      size: rawCollectionAttributeAccount.size,
      attributeType: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionAttributeAccount.attributeType.filter(
            (segment) => segment !== 0
          )
        )
      ),
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionAttributeAccount.name.filter((segment) => segment !== 0)
        )
      ),
      authority: rawCollectionAttributeAccount.authority,
      collection: rawCollectionAttributeAccount.collection,
    },
    account,
  };
};

interface RawCollectionInstructionAccount {
  authority: PublicKey;
  bump: number;
  collection: PublicKey;
  name: Uint8Array;
  attributeType: Uint8Array;
  size: number;
}

export const CollectionInstructionAccountParser = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): CollectionInstructionAccount => {
  const rawCollectionInstructionAccount = accountCoder.decode(
    COLLECTION_INSTRUCTION_ACCOUNT_NAME,
    account.data
  ) as RawCollectionInstructionAccount;

  return {
    pubkey: publicKey,
    info: {
      bump: rawCollectionInstructionAccount.bump,
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionInstructionAccount.name.filter(
            (segment) => segment !== 0
          )
        )
      ),
      authority: rawCollectionInstructionAccount.authority,
      collection: rawCollectionInstructionAccount.collection,
    },
    account,
  };
};

interface RawCollectionInstructionArgumentAccount {
  authority: PublicKey;
  bump: number;
  collection: PublicKey;
  name: Uint8Array;
  argumentType: Uint8Array;
}

export const CollectionInstructionArgumentAccountParser = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): CollectionInstructionArgumentAccount => {
  const rawCollectionInstructionArgumentAccount = accountCoder.decode(
    COLLECTION_INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
    account.data
  ) as RawCollectionInstructionArgumentAccount;

  return {
    pubkey: publicKey,
    info: {
      bump: rawCollectionInstructionArgumentAccount.bump,
      name: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionInstructionArgumentAccount.name.filter(
            (segment) => segment !== 0
          )
        )
      ),
      argumentType: utils.bytes.utf8.decode(
        new Uint8Array(
          rawCollectionInstructionArgumentAccount.argumentType.filter(
            (segment) => segment !== 0
          )
        )
      ),
      authority: rawCollectionInstructionArgumentAccount.authority,
      collection: rawCollectionInstructionArgumentAccount.collection,
    },
    account,
  };
};
