import { AccountInfo, PublicKey, Transaction } from '@solana/web3.js';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export interface ApplicationInfo {
  authority: PublicKey;
  name: string;
}

export interface Application {
  pubkey: PublicKey;
  info: ApplicationInfo;
  account: AccountInfo<Buffer>;
}

export interface CollectionInfo {
  authority: PublicKey;
  application: PublicKey;
  name: string;
  bump: number;
}

export interface Collection {
  pubkey: PublicKey;
  info: CollectionInfo;
  account: AccountInfo<Buffer>;
}

export interface CollectionAttributeInfo {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  name: string;
  kind: {
    name: string;
    size: number;
  };
  modifier: {
    name: string;
    size: number;
  };
  bump: number;
}

export interface CollectionAttribute {
  pubkey: PublicKey;
  info: CollectionAttributeInfo;
  account: AccountInfo<Buffer>;
}

export interface CollectionInstructionInfo {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  name: string;
  bump: number;
}

export interface CollectionInstruction {
  pubkey: PublicKey;
  info: CollectionInstructionInfo;
  account: AccountInfo<Buffer>;
}

export interface CollectionInstructionArgumentInfo {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  instruction: PublicKey;
  name: string;
  kind: string;
  modifier: {
    name: string;
    size: number;
  };
  bump: number;
}

export interface CollectionInstructionArgument {
  pubkey: PublicKey;
  info: CollectionInstructionArgumentInfo;
  account: AccountInfo<Buffer>;
}

export interface InstructionAccountInfo {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  instruction: PublicKey;
  name: string;
  kind: string;
  bump: number;
}

export interface InstructionAccount {
  pubkey: PublicKey;
  info: InstructionAccountInfo;
  account: AccountInfo<Buffer>;
}

export interface AccountBoolAttributeInfo {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  instruction: PublicKey;
  account: PublicKey;
  kind: string;
  bump: number;
}

export interface AccountBoolAttribute {
  pubkey: PublicKey;
  info: AccountBoolAttributeInfo;
  account: AccountInfo<Buffer>;
}

export type AccountBoolAttributeKind = 0 | 1 | 2;
