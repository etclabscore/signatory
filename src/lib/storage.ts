import { DeterministicWallet, NonDeterministicWallet, WalletType, AccountInfo, WalletInfo } from "./wallet";
/**
 * AccountStorageData - is an interface to describe the basic storage data type storing privateKey and encryption version string
 */
export type AccountStorageData = DeterministicWallet | NonDeterministicWallet;

export type AccountMetadata = AccountInfo | WalletInfo;
/**
 * Storage - is an interface to describe the basic storage functionality for signatory
 */
export interface Storage {

  open: () => Promise<void>;
  close: () => Promise<void>;
  /**
   * getAccount - returns storage data for the account
   * @param address - an ethereum public address
   * @returns AccountStorageData -
   */
  getAccount: (address: string) => Promise<NonDeterministicWallet>;
  /**
   * getHDWallet - returns storage data for the HD wallet
   * @param uuid - the hd wallet uuid
   * @returns AccountStorageData
   */
  getHDWallet: (uuid: string) => Promise<DeterministicWallet>;
  /**
   * storeAccount - returns storage data for the account
   * @param passPhrase - passphrase for encrypting the data
   * @param privateKey - privateKey to encrypt
   * @returns AccountStorageData
   */
  storeAccount: (wallet: AccountStorageData) => Promise<AccountStorageData>;
  /**
   * listAccounts - returns an array of "0x" Ethereum addresses
   * @returns array of Ethereum addresses;
   */
  listWallets: (type: WalletType, visible: boolean) => Promise<AccountMetadata[]>;
}
