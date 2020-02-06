export type Hidden = boolean;
export type Address = string;
export type AccountName = string;
export type AccountDescription = string;
/**
 *
 * optional private key field for importing
 *
 */
export type PrivateKey = string;
/**
 *
 * passphrase to keyfile
 *
 */
export type AnySGkEczp1 = any;
export interface NewAccount {
  name?: AccountName;
  description?: AccountDescription;
  privateKey?: PrivateKey;
  passphrase: AnySGkEczp1;
  [k: string]: any;
}
/**
 *
 * The gas limit provided by the sender in Wei
 *
 */
export type Gas = string;
/**
 *
 * The gas price willing to be paid by the sender in Wei
 *
 */
export type GasPrice = string;
/**
 *
 * The data field sent with the transaction
 *
 */
export type Data = string;
/**
 *
 * The total number of prior transactions made by the sender
 *
 */
export type Nonce = string;
/**
 *
 * Value of Ether being transferred in Wei
 *
 */
export type Wei = string;
export interface Transaction {
  from: Address;
  gas: Gas;
  gasPrice: GasPrice;
  data?: Data;
  nonce: Nonce;
  to?: Address;
  value?: Wei;
  [k: string]: any;
}
/**
 *
 * passphrase used to encode keyfile (recommend to use 8+ words with good entropy)
 *
 */
export type Passphrase = string;
export type ChainId = number;
export type StringDoaGddGA = string;
export interface TypedData {
  name?: StringDoaGddGA;
  type?: StringDoaGddGA;
  [k: string]: any;
}
export type Eip712Domain = TypedData[];
export interface Types {
  EIP712Domain: Eip712Domain;
}
export interface ObjectHAgrRKSz { [key: string]: any; }
export interface SignedTypedData {
  types: Types;
  primaryType: StringDoaGddGA;
  domain: ObjectHAgrRKSz;
  message: ObjectHAgrRKSz;
  [k: string]: any;
}
export type Integer2AHOqbcQ = number;
export type Iv = string;
export interface ObjectOfIv0Y2C7QDo {
  iv?: Iv;
  [k: string]: any;
}
export type Dklen = number;
export interface ObjectOfStringDoaGddGAInteger2AHOqbcQInteger2AHOqbcQInteger2AHOqbcQDklenM9EYoAXy {
  dklen: Dklen;
  salt: StringDoaGddGA;
  n: Integer2AHOqbcQ;
  r: Integer2AHOqbcQ;
  p: Integer2AHOqbcQ;
  [k: string]: any;
}
export interface Crypto {
  ciphertext: StringDoaGddGA;
  cipherparams: ObjectOfIv0Y2C7QDo;
  cipher: StringDoaGddGA;
  kdf: StringDoaGddGA;
  kdfparams: ObjectOfStringDoaGddGAInteger2AHOqbcQInteger2AHOqbcQInteger2AHOqbcQDklenM9EYoAXy;
  mac: StringDoaGddGA;
  [k: string]: any;
}
export interface Keyfile {
  version: Integer2AHOqbcQ;
  id: StringDoaGddGA;
  crypto: Crypto;
  [k: string]: any;
}
/**
 *
 * a list of 24 words
 *
 */
export type Mnemonic = string;
export type MnemonicName = string;
export type MnemonicDescription = string;
export type MnemonicHDPath = string;
export interface ImportMnemonicOptions {
  mnemonic: Mnemonic;
  name?: MnemonicName;
  description?: MnemonicDescription;
  passphrase: Passphrase;
  hdPath: MnemonicHDPath;
  [k: string]: any;
}
export type Uuid = string;
export type Index = any;
export interface AccountMnemonicOptions {
  uuid: Uuid;
  passphrase: Passphrase;
  index?: Index;
  [k: string]: any;
}
export type HexString = string;
export interface Account {
  address: Address;
  name?: AccountName;
  description?: AccountDescription;
  hidden: Hidden;
  [k: string]: any;
}
export type Accounts = Account[];
export type WalletName = string;
export type WalletDescription = string;
export type HdPath = string;
export interface Wallet {
  uuid: Uuid;
  name?: WalletName;
  description?: WalletDescription;
  hdPath: HdPath;
  hidden: Hidden;
  [k: string]: any;
}
export type Wallets = Wallet[];
export type AccountExists = boolean;
export interface SignedTypedDataResult {
  signature: HexString;
  encodedData: StringDoaGddGA;
  [k: string]: any;
}
/**
 *
 * Generated! Represents an alias to any of the provided schemas
 *
 */
export type AnyOfHiddenHiddenAddressAddressNewAccountTransactionPassphraseChainIdSignedTypedDataAddressPassphraseChainIdPassphraseKeyfileImportMnemonicOptionsAccountMnemonicOptionsAddressHexStringAddressPassphraseChainIdAccountsWalletsAccountExistsAccountExistsAddressHexStringSignedTypedDataResultAddressMnemonicStringDoaGddGAAddressKeyfileHexString = Hidden | Address | NewAccount | Transaction | Passphrase | ChainId | SignedTypedData | Keyfile | ImportMnemonicOptions | AccountMnemonicOptions | HexString | Accounts | Wallets | AccountExists | SignedTypedDataResult | Mnemonic | StringDoaGddGA;
export type ListAccounts = (hidden?: Hidden) => Promise<Accounts>;
export type ListWallets = (hidden?: Hidden) => Promise<Wallets>;
export type HideAccount = (address: Address) => Promise<AccountExists>;
export type UnhideAccount = (address: Address) => Promise<AccountExists>;
export type CreateAccount = (newAccount: NewAccount) => Promise<Address>;
export type SignTransaction = (transaction: Transaction, passphrase: Passphrase, chainId: ChainId) => Promise<HexString>;
export type SignTypedData = (typedData: SignedTypedData, address: Address, passphrase: Passphrase, chainId: ChainId) => Promise<SignedTypedDataResult>;
export type ImportKeyfile = (passphrase: Passphrase, keyfile: Keyfile) => Promise<Address>;
export type GenerateMnemonic = () => Promise<Mnemonic>;
export type ImportMnemonic = (importMnemonicOptions: ImportMnemonicOptions) => Promise<StringDoaGddGA>;
export type GetAccountFromMnemonic = (accountFromMnemonicOptions: AccountMnemonicOptions) => Promise<Address>;
export type ExportAccount = (address: Address) => Promise<Keyfile>;
export type Sign = (dataToSign: HexString, address: Address, passphrase: Passphrase, chainId: ChainId) => Promise<HexString>;