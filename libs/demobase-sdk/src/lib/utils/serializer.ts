import { AccountsCoder, Idl, utils } from '@project-serum/anchor';
import { AccountInfo, PublicKey } from '@solana/web3.js';

import { APPLICATION_ACCOUNT_NAME } from '.';
import * as idl from '../idl.json';
import { ApplicationAccount } from '../types';

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
