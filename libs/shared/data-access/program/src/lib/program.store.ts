import { Injectable } from '@angular/core';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import {
  ApplicationParser,
  CollectionAttributeParser,
  CollectionParser,
  DEMOBASE_PROGRAM_ID,
  DummyWallet,
  idl,
  InstructionAccountParser,
  InstructionArgumentParser,
  InstructionParser,
} from '@demobase-labs/demobase-sdk';
import { isNotNullOrUndefined } from '@demobase-labs/shared/utils/operators';
import { ComponentStore } from '@ngrx/component-store';
import { Idl, Program, Provider } from '@project-serum/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { combineLatest, defer, from } from 'rxjs';
import { concatMap, map, take, tap } from 'rxjs/operators';

interface ViewModel {
  reader: Program | null;
  writer: Program | null;
}

const initialState = {
  reader: null,
  writer: null,
};

@Injectable()
export class ProgramStore extends ComponentStore<ViewModel> {
  readonly reader$ = this.select(({ reader }) => reader);
  readonly writer$ = this.select(({ writer }) => writer);

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _connectionStore: ConnectionStore
  ) {
    super(initialState);
  }

  readonly loadReader = this.effect(() =>
    this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      tap((connection) =>
        this.patchState({
          reader: new Program(
            idl,
            DEMOBASE_PROGRAM_ID,
            new Provider(
              connection,
              new DummyWallet(),
              Provider.defaultOptions()
            )
          ),
        })
      )
    )
  );

  readonly loadWriter = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$.pipe(isNotNullOrUndefined),
      this._walletStore.anchorWallet$,
    ]).pipe(
      tap(([connection, wallet]) =>
        this.patchState({
          writer: wallet
            ? new Program(
                idl as Idl,
                DEMOBASE_PROGRAM_ID,
                new Provider(connection, wallet, {
                  commitment: 'confirmed',
                })
              )
            : null,
        })
      )
    )
  );

  getApplications() {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(defer(() => reader.account.application.all())).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              ApplicationParser(publicKey, account)
            )
          )
        )
      )
    );
  }

  getApplication(applicationId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() => reader.account.application.fetchNullable(applicationId))
        ).pipe(
          map(
            (account) =>
              account &&
              ApplicationParser(new PublicKey(applicationId), account)
          )
        )
      )
    );
  }

  createApplication(applicationName: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        const application = Keypair.generate();

        return from(
          defer(() =>
            writer.rpc.createApplication(applicationName, {
              accounts: {
                application: application.publicKey,
                authority: walletPublicKey,
                systemProgram: SystemProgram.programId,
              },
              signers: [application],
            })
          )
        );
      })
    );
  }

  updateApplication(applicationId: string, applicationName: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateApplication(applicationName, {
              accounts: {
                application: new PublicKey(applicationId),
                authority: walletPublicKey,
              },
            })
          )
        )
      )
    );
  }

  deleteApplication(applicationId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteApplication({
              accounts: {
                application: new PublicKey(applicationId),
                authority: walletPublicKey,
              },
            })
          )
        )
      )
    );
  }

  getCollections(applicationId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.collection.all([
              { memcmp: { bytes: applicationId, offset: 40 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              CollectionParser(publicKey, account)
            )
          )
        )
      )
    );
  }

  getCollection(collectionId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() => reader.account.collection.fetchNullable(collectionId))
        ).pipe(
          map(
            (account) =>
              account && CollectionParser(new PublicKey(collectionId), account)
          )
        )
      )
    );
  }

  createCollection(applicationId: string, collectionName: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        const collection = Keypair.generate();

        return from(
          defer(() =>
            writer.rpc.createCollection(collectionName, {
              accounts: {
                collection: collection.publicKey,
                application: new PublicKey(applicationId),
                authority: walletPublicKey,
                systemProgram: SystemProgram.programId,
              },
              signers: [collection],
            })
          )
        );
      })
    );
  }

  updateCollection(collectionId: string, collectionName: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateCollection(collectionName, {
              accounts: {
                collection: new PublicKey(collectionId),
                authority: walletPublicKey,
              },
            })
          )
        )
      )
    );
  }

  deleteCollection(collectionId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteCollection({
              accounts: {
                collection: new PublicKey(collectionId),
                authority: walletPublicKey,
              },
            })
          )
        )
      )
    );
  }

  getCollectionAttributes(collectionId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.collectionAttribute.all([
              { memcmp: { bytes: collectionId, offset: 72 } },
            ])
          )
        ).pipe(
          map((programArguments) =>
            programArguments.map(({ publicKey, account }) =>
              CollectionAttributeParser(publicKey, account)
            )
          )
        )
      )
    );
  }

  createCollectionAttribute(
    applicationId: string,
    collectionId: string,
    attributeName: string,
    attributeKind: number,
    attributeModifier: number,
    attributeSize: number
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        const attribute = Keypair.generate();

        return from(
          defer(() =>
            writer.rpc.createCollectionAttribute(
              attributeName,
              attributeKind,
              attributeModifier,
              attributeSize,
              {
                accounts: {
                  attribute: attribute.publicKey,
                  collection: new PublicKey(collectionId),
                  application: new PublicKey(applicationId),
                  authority: walletPublicKey,
                  systemProgram: SystemProgram.programId,
                },
                signers: [attribute],
              }
            )
          )
        );
      })
    );
  }

  updateCollectionAttribute(
    attributeId: string,
    attributeName: string,
    attributeKind: number,
    attributeModifier: number,
    attributeSize: number
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateCollectionAttribute(
              attributeName,
              attributeKind,
              attributeModifier,
              attributeSize,
              {
                accounts: {
                  attribute: new PublicKey(attributeId),
                  authority: walletPublicKey,
                },
              }
            )
          )
        )
      )
    );
  }

  deleteCollectionAttribute(attributeId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteCollectionAttribute({
              accounts: {
                attribute: new PublicKey(attributeId),
                authority: walletPublicKey,
              },
            })
          )
        )
      )
    );
  }

  getInstructions(applicationId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.instruction.all([
              { memcmp: { bytes: applicationId, offset: 40 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              InstructionParser(publicKey, account)
            )
          )
        )
      )
    );
  }

  getInstruction(instructionId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() => reader.account.instruction.fetchNullable(instructionId))
        ).pipe(
          map(
            (account) =>
              account &&
              InstructionParser(new PublicKey(instructionId), account)
          )
        )
      )
    );
  }

  createInstruction(applicationId: string, instructionName: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        const instruction = Keypair.generate();

        return from(
          defer(() =>
            writer.rpc.createInstruction(instructionName, {
              accounts: {
                instruction: instruction.publicKey,
                application: new PublicKey(applicationId),
                authority: walletPublicKey,
                systemProgram: SystemProgram.programId,
              },
              signers: [instruction],
            })
          )
        );
      })
    );
  }

  updateInstruction(instructionId: string, instructionName: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateInstruction(instructionName, {
              accounts: {
                instruction: new PublicKey(instructionId),
                authority: walletPublicKey,
              },
            })
          )
        )
      )
    );
  }

  deleteInstruction(instructionId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteInstruction({
              accounts: {
                instruction: new PublicKey(instructionId),
                authority: walletPublicKey,
              },
            })
          )
        )
      )
    );
  }

  getInstructionAccounts(instructionId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.instructionAccount.all([
              { memcmp: { bytes: instructionId, offset: 72 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              InstructionAccountParser(publicKey, account)
            )
          )
        )
      )
    );
  }

  createInstructionAccount(
    applicationId: string,
    instructionId: string,
    collectionId: string,
    accountName: string,
    accountKind: number,
    accountMarkAttribute: number
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        const account = Keypair.generate();

        return from(
          defer(() =>
            writer.rpc.createInstructionAccount(
              accountName,
              accountKind,
              accountMarkAttribute,
              {
                accounts: {
                  account: account.publicKey,
                  instruction: new PublicKey(instructionId),
                  collection: new PublicKey(collectionId),
                  application: new PublicKey(applicationId),
                  authority: walletPublicKey,
                  systemProgram: SystemProgram.programId,
                },
                signers: [account],
              }
            )
          )
        );
      })
    );
  }

  updateInstructionAccount(
    accountId: string,
    collectionId: string,
    accountName: string,
    accountKind: number,
    accountMarkAttribute: number
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateInstructionAccount(
              accountName,
              accountKind,
              accountMarkAttribute,
              {
                accounts: {
                  account: new PublicKey(accountId),
                  authority: walletPublicKey,
                  collection: new PublicKey(collectionId),
                },
              }
            )
          )
        )
      )
    );
  }

  deleteInstructionAccount(accountId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteInstructionAccount({
              accounts: {
                account: new PublicKey(accountId),
                authority: walletPublicKey,
              },
            })
          )
        )
      )
    );
  }

  getInstructionArguments(instructionId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.instructionArgument.all([
              { memcmp: { bytes: instructionId, offset: 72 } },
            ])
          )
        ).pipe(
          map((programArguments) =>
            programArguments.map(({ publicKey, account }) =>
              InstructionArgumentParser(publicKey, account)
            )
          )
        )
      )
    );
  }

  createInstructionArgument(
    applicationId: string,
    instructionId: string,
    argumentName: string,
    argumentKind: number,
    argumentModifier: number,
    argumentSize: number
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        const argument = Keypair.generate();

        return from(
          defer(() =>
            writer.rpc.createInstructionArgument(
              argumentName,
              argumentKind,
              argumentModifier,
              argumentSize,
              {
                accounts: {
                  argument: argument.publicKey,
                  instruction: new PublicKey(instructionId),
                  application: new PublicKey(applicationId),
                  authority: walletPublicKey,
                  systemProgram: SystemProgram.programId,
                },
                signers: [argument],
              }
            )
          )
        );
      })
    );
  }

  updateInstructionArgument(
    argumentId: string,
    argumentName: string,
    argumentKind: number,
    argumentModifier: number,
    argumentSize: number
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateInstructionArgument(
              argumentName,
              argumentKind,
              argumentModifier,
              argumentSize,
              {
                accounts: {
                  argument: new PublicKey(argumentId),
                  authority: walletPublicKey,
                },
              }
            )
          )
        )
      )
    );
  }

  deleteInstructionArgument(argumentId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteInstructionArgument({
              accounts: {
                argument: new PublicKey(argumentId),
                authority: walletPublicKey,
              },
            })
          )
        )
      )
    );
  }
}
