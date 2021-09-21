import { Commitment, Connection, PublicKey } from '@solana/web3.js';

import { ApplicationAccount } from './types';
import { ApplicationAccountParser } from './utils';

export const getApplication = async (
  connection: Connection,
  applicationId: PublicKey,
  commitment?: Commitment
): Promise<ApplicationAccount | null> => {
  const account = await connection.getAccountInfo(applicationId, commitment);

  return account && ApplicationAccountParser(applicationId, account);
};
