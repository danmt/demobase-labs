import { AccountInfo, PublicKey, Transaction } from '@solana/web3.js';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export interface ApplicationInfo {
  name: string;
  authority: PublicKey;
}

export interface Application {
  pubkey: PublicKey;
  info: ApplicationInfo;
  account: AccountInfo<Buffer>;
}

export interface CollectionInfo {
  name: string;
  authority: PublicKey;
  application: PublicKey;
  bump: number;
}

export interface Collection {
  pubkey: PublicKey;
  info: CollectionInfo;
  account: AccountInfo<Buffer>;
}

export interface CollectionAttributeInfo {
  name: string;
  attributeType: string;
  size: number;
  authority: PublicKey;
  collection: PublicKey;
  bump: number;
}

export interface CollectionAttribute {
  pubkey: PublicKey;
  info: CollectionAttributeInfo;
  account: AccountInfo<Buffer>;
}

export interface CollectionInstructionInfo {
  name: string;
  authority: PublicKey;
  collection: PublicKey;
  bump: number;
}

export interface CollectionInstruction {
  pubkey: PublicKey;
  info: CollectionInstructionInfo;
  account: AccountInfo<Buffer>;
}

export interface CollectionInstructionArgumentInfo {
  name: string;
  authority: PublicKey;
  collection: PublicKey;
  bump: number;
  argumentType: string;
}

export interface CollectionInstructionArgument {
  pubkey: PublicKey;
  info: CollectionInstructionArgumentInfo;
  account: AccountInfo<Buffer>;
}

export interface InstructionAccountInfo {
  name: string;
  authority: PublicKey;
  instruction: PublicKey;
  collection: PublicKey;
  bump: number;
  kind: string;
}

export interface InstructionAccount {
  pubkey: PublicKey;
  info: InstructionAccountInfo;
  account: AccountInfo<Buffer>;
}

export interface AccountBoolAttributeInfo {
  authority: PublicKey;
  account: PublicKey;
  instruction: PublicKey;
  bump: number;
  kind: string;
}

export interface AccountBoolAttribute {
  pubkey: PublicKey;
  info: AccountBoolAttributeInfo;
  account: AccountInfo<Buffer>;
}

export type AccountBoolAttributeKind = 0 | 1 | 2;
