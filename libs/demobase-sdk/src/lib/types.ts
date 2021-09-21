import { AccountInfo, PublicKey, Transaction } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export interface Application {
  name: string;
  count: number;
}

export interface ApplicationAccountInfo {
  name: string;
  count: number;
  authority: PublicKey;
}

export interface ApplicationAccount {
  pubkey: PublicKey;
  info: ApplicationAccountInfo;
  account: AccountInfo<Buffer>;
}

export interface RawApplication {
  name: Uint8Array;
  count: BN;
}
