import { PublicKey, Transaction } from '@solana/web3.js';
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

export interface RawApplication {
  name: Uint8Array;
  count: BN;
}
