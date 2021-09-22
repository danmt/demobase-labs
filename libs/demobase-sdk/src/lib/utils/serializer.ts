import { AccountsCoder, Idl, utils } from '@project-serum/anchor';
import { AccountInfo, PublicKey } from '@solana/web3.js';

import { APPLICATION_ACCOUNT_NAME, COLLECTION_ACCOUNT_NAME } from '.';
import * as idl from '../idl.json';
import { ApplicationAccount, CollectionAccount } from '../types';

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
