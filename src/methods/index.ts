/**
 * This handles the routing for the RPC server, exposing the methods that the server handles
 */
import { makeLogger } from "../lib/logging";
import { IMethodMapping } from "@open-rpc/server-js/build/router";
import { hexToString, hexToNumber } from "@etclabscore/eserialize";
import * as types from "../generated-types";
import { Storage } from "../lib/storage";
import { createNonDeterministicWallet, AccountInfo, WalletInfo } from "../lib/wallet";
import * as account from "../lib/wallet";
import Wallet, { V3Keystore } from "@etclabscore/ethereumjs-wallet";
import * as bip39 from "bip39";
import { personalSign, signTransaction, signTypedData } from "../lib/sign";

const logger = makeLogger("Signatory", "Methods");

export interface SignatoryMethodMapping extends IMethodMapping {
  listAccounts: types.ListAccounts;
  listWallets: types.ListWallets;
  createAccount: types.CreateAccount;
  hideAccount: types.HideAccount;
  unhideAccount: types.UnhideAccount;
  importKeyfile: types.ImportKeyfile;
  generateMnemonic: types.GenerateMnemonic;
  exportAccount: types.ExportAccount;
  sign: types.Sign;
  signTransaction: types.SignTransaction;
  signTypedData: types.SignTypedData;
  importMnemonic: types.ImportMnemonic;
  getAccountFromMnemonic: types.GetAccountFromMnemonic;
}
/**
 * Returns the MethodMapping for the RPC Server essentially the routes.
 *
 *
 * @returns The config of the signatory service
 */
export const methods = (storage: Storage): SignatoryMethodMapping => {

  return {

    listAccounts: async (hidden?: types.Hidden) => {
      const isHidden = hidden || false;
      const wallets = await storage.listWallets("non-deterministic", isHidden) as AccountInfo[];
      return wallets.map((metadata) => {
        const { address, name, description, parent } = metadata;
        return { address, name, description, parent, hidden: metadata.hidden };
      });
    },
    listWallets: async (hidden?: types.Hidden) => {
      const isHidden = hidden || false;
      const wallets = await storage.listWallets("deterministic", isHidden) as WalletInfo[];
      return wallets.map((metadata) => {
        const { uuid, name, description, hdPath } = metadata;
        return { uuid, name, description, hdPath, hidden: metadata.hidden };
      });
    },

    createAccount: async (newAccount: types.NewAccount) => {
      const privateKey = newAccount.privateKey ? Buffer.from(newAccount.privateKey, "hex") : undefined;
      const accountData = Object.assign({}, newAccount, { privateKey });
      const wallet = createNonDeterministicWallet(accountData);
      await storage.storeAccount(wallet);
      return wallet.address;
    },

    hideAccount: async (address: string) => {
      const wallet = await storage.getAccount(address);
      wallet.visible = false;
      await storage.storeAccount(wallet);
      return true;
    },

    unhideAccount: async (address: string) => {
      const wallet = await storage.getAccount(address);
      wallet.visible = true;
      await storage.storeAccount(wallet);
      return true;
    },

    getAccountFromMnemonic: async (options: types.AccountMnemonicOptions) => {
      const wallet = await storage.getHDWallet(options.uuid);
      const hdIndex = options.index === undefined ? wallet.nextAccount++ : options.index;
      const ndWallet = account.getAccountFromHDWallet(wallet, options.passphrase, hdIndex);
      await storage.storeAccount(ndWallet);
      await storage.storeAccount(wallet);
      return ndWallet.address;
    },

    importKeyfile: async (passphrase: string, keyfile: types.Keyfile) => {

      // NOTE dangerous cast needs schema enforcement;
      const wallet = account.createNonDeterministicWalletFromKeyfile(passphrase, keyfile as V3Keystore);
      await storage.storeAccount(wallet);
      return wallet.address;
    },

    generateMnemonic: async () => {
      return bip39.generateMnemonic();
    },

    importMnemonic: async (options: types.ImportMnemonicOptions) => {
      const seed = await bip39.mnemonicToSeed(options.mnemonic);
      const wallet = account.createDeterministicWallet(options.passphrase, seed, options.hdPath);
      await storage.storeAccount(wallet);
      return wallet.uuid;
    },

    exportAccount: async (address: string) => {
      const wallet = await storage.getAccount(address);
      // NOTE dangerous cast needs schema enforcement;
      return wallet.keystore as types.Keyfile;
    },

    sign: async (dataToSign: string, address: string, passphrase: string, chainId: types.ChainId) => {
      const wallet = await storage.getAccount(address);
      const acct = Wallet.fromV3(wallet.keystore, passphrase);
      return personalSign(Buffer.from(hexToString(dataToSign)), acct.getPrivateKey(), hexToNumber(chainId));
    },

    signTransaction: async (transaction: types.Transaction, passphrase: string, chainId: types.ChainId) => {
      const wallet = await storage.getAccount(transaction.from);
      const acct = Wallet.fromV3(wallet.keystore, passphrase);
      const privKey = acct.getPrivateKey();
      return signTransaction(transaction, privKey, hexToNumber(chainId));
    },

    signTypedData: async (typedData: types.TypedData, address: types.Address, passphrase: types.Passphrase, chainId: types.ChainId) => {
      const wallet = await storage.getAccount(address);
      const acct = Wallet.fromV3(wallet.keystore, passphrase);
      const { signature, data } = signTypedData(typedData, acct.getPrivateKey(), parseInt(chainId, 16));
      return { signature, encodedData: "0x" + data.toString("hex") };
    },

  };

};
