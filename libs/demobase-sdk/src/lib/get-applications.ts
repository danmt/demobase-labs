import { Commitment, Connection } from '@solana/web3.js';
import { encode } from 'bs58';

import { ApplicationAccount } from './types';
import {
  APPLICATION_ACCOUNT_DATA_SIZE,
  APPLICATION_ACCOUNT_NAME,
  ApplicationAccountParser,
  DEMOBASE_PROGRAM_ID,
  getAccountDiscriminator,
} from './utils';

export const getApplications = async (
  connection: Connection,
  commitment?: Commitment
): Promise<ApplicationAccount[]> => {
  const filters = [
    { dataSize: APPLICATION_ACCOUNT_DATA_SIZE },
    {
      memcmp: {
        bytes: encode(getAccountDiscriminator(APPLICATION_ACCOUNT_NAME)),
        offset: 0,
      },
    },
  ];

  const programAccounts = await connection.getProgramAccounts(
    DEMOBASE_PROGRAM_ID,
    {
      filters,
      commitment,
    }
  );

  return programAccounts.map(({ account, pubkey }) =>
    ApplicationAccountParser(pubkey, account)
  );
};
