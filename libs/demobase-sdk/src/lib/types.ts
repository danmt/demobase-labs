import { AccountInfo, PublicKey, Transaction } from '@solana/web3.js';

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

export interface CollectionAccountInfo {
  name: string;
  count: number;
  authority: PublicKey;
  application: PublicKey;
  bump: number;
}

export interface CollectionAccount {
  pubkey: PublicKey;
  info: CollectionAccountInfo;
  account: AccountInfo<Buffer>;
}

export interface CollectionAttributeAccountInfo {
  name: string;
  attributeType: string;
  size: number;
  authority: PublicKey;
  collection: PublicKey;
  bump: number;
}

export interface CollectionAttributeAccount {
  pubkey: PublicKey;
  info: CollectionAttributeAccountInfo;
  account: AccountInfo<Buffer>;
}
