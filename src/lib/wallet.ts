import Wallet, { V3Keystore } from "@etclabscore/ethereumjs-wallet";
import { randomBytes } from "crypto";
import uuidV4 from "uuid/v4";
import HDKey from "hdkey";
/**
 * Account handles creation and translation of account data
 */
export type WalletType = "non-deterministic" | "deterministic";

export interface SignatoryWallet {
  type: WalletType;
  keystore: V3Keystore;
  uuid: string;
  name?: string;
  description?: string;
  visible: boolean;
}

export interface AccountData {
  passphrase: string;
  name?: string;
  description?: string;
  privateKey?: Buffer;
}

export interface AccountInfo extends Metadata {
  address: string;
  type: "non-deterministic";
  parent?: string;
}

export interface WalletInfo extends Metadata {
  uuid: string;
  type: "deterministic";
  hdPath: string;
}

export interface Metadata {
  name?: string;
  description?: string;
  type: WalletType;
  hidden: boolean;
}

export interface NonDeterministicWallet extends SignatoryWallet {
  type: "non-deterministic";
  address: string;
  parent?: string;
}

export interface DeterministicWallet extends SignatoryWallet {
  type: "deterministic";
  nextAccount: number;
  hdPath: string;
}

const generateUUID = (): string => {
  return uuidV4();
};

export const createDeterministicWallet = (passphrase: string, seed: Buffer, hdPath: string): DeterministicWallet => {
  const keystore = Wallet.dataToV3(passphrase, seed);
  return {
    type: "deterministic",
    keystore,
    uuid: generateUUID(),
    hdPath,
    nextAccount: 0,
    visible: true,
  };
};

export const getWallet = (wallet: NonDeterministicWallet | DeterministicWallet, passphrase: string): Wallet => {
  return Wallet.fromV3(wallet.keystore, passphrase);
};

export const getAccountFromHDWallet = (wallet: DeterministicWallet, passphrase: string, index: number) => {
  const seed = Wallet.fromV3Data(wallet.keystore, passphrase);
  const hdkey = HDKey.fromMasterSeed(seed);
  const childKey = hdkey.derive(wallet.hdPath + `/${index}`);
  return createNonDeterministicWallet({ passphrase, privateKey: childKey.privateKey }, wallet.uuid);
};

export const createNonDeterministicWalletFromKeyfile = (passphrase: string, keyFile: V3Keystore): NonDeterministicWallet => {
  const wallet = Wallet.fromV3(keyFile, passphrase);
  const address = wallet.getChecksumAddressString();
  return {
    type: "non-deterministic",
    keystore: keyFile,
    uuid: generateUUID().toString(),
    address,
    visible: true,
  };
};

export const createNonDeterministicWallet = (acctDesc: AccountData, parent: string | undefined = undefined): NonDeterministicWallet => {

  const privKey = acctDesc.privateKey ? acctDesc.privateKey : randomBytes(32);
  const wallet = new Wallet(privKey);
  const keystore = wallet.toV3(acctDesc.passphrase);
  const address = wallet.getChecksumAddressString();

  return {
    type: "non-deterministic",
    keystore,
    uuid: generateUUID().toString(),
    address,
    name: acctDesc.name,
    description: acctDesc.description,
    parent,
    visible: true,
  };
};

/**
 * getPrivateKey - creates a new Account and returns a privatekey
 * @param passphrase - a passphrase of the user's choosing
 * @param encryptedKey - an encryptedKey that represents the privateKey
 * @param version - gives the version of the encrypted data, future proofing storage
 * @returns string - a private key associated with the account
 */
export const exportPrivateKey = (passphrase: string, keystore: V3Keystore): string => {
  const wallet = Wallet.fromV3(keystore, passphrase);
  return wallet.getPrivateKeyString();
};

export const importPrivateKey = (passphrase: string, privateKey: string): V3Keystore => {
  const buffer = new Buffer(privateKey, "hex");
  const wallet = Wallet.fromPrivateKey(buffer);
  return wallet.toV3(passphrase);
};

export const DEFAULT_HD_PATH = "m/44'/60'/0'";
