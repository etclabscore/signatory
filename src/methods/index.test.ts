import { methods, SignatoryMethodMapping } from "./index";
import { MemoryStorage } from "../lib/memoryStorage";
import { DEFAULT_HD_PATH, AccountInfo } from "../lib/wallet";
import { NonDeterministicWallet, DeterministicWallet } from "../lib/wallet";
import * as wallet from "../lib/wallet";
import dWallet from "../fixtures/wallet.json";
import ndWallet from "../fixtures/ndwallet.json";
import hdWallet from "../fixtures/dwallet.json";
import typedData from "../fixtures/typedData.json";
import * as sign from "../lib/sign";
import * as util from "ethereumjs-util";
import * as ethTx from "ethereumjs-tx";
import * as types from "../generated-types";
import * as rlp from "rlp";
import ethCommon from "ethereumjs-common";
// tslint:disable-next-line:no-var-requires
const sigUtil = require("eth-sig-util");

describe("Methods for handling signatory request", () => {
  let memoryStorage: MemoryStorage;
  let dummyAccount: NonDeterministicWallet;
  let dummyHDAccount: DeterministicWallet;
  let dummyHDWallet: DeterministicWallet;
  let handlers: SignatoryMethodMapping;
  let testMnemonic: string;

  let hdPath;
  beforeAll(async () => {
    dummyAccount = ndWallet as NonDeterministicWallet;
    dummyHDAccount = dWallet as DeterministicWallet;
    dummyHDWallet = hdWallet as DeterministicWallet;
    hdPath = DEFAULT_HD_PATH;
    memoryStorage = new MemoryStorage();
    testMnemonic = [...Array(12).keys()].map(() => "potato").join(" ");
    await memoryStorage.storeAccount(dummyAccount);
    await memoryStorage.storeAccount(dummyHDAccount);
    handlers = methods(memoryStorage);

  });
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it("should listAccounts", async () => {
    const accts = await handlers.listAccounts();
    expect(accts.length).toEqual(1);
    expect(accts[0].address).toEqual(dummyAccount.address);
  });

  it("should listWallets", async () => {
    const wallets = await handlers.listWallets();
    expect(wallets.length).toEqual(1);
    expect(wallets[0].uuid).toEqual(dummyHDAccount.uuid);
  });

  it("should createAccount", async () => {
    jest.spyOn(wallet, "createNonDeterministicWallet").mockReturnValue(dummyAccount);
    const createAccountHandler = methods(new MemoryStorage());
    const address = await createAccountHandler.createAccount({ passphrase: "testtestt" });
    const wallets = await memoryStorage.listWallets("non-deterministic", false) as AccountInfo[];
    expect(wallets.length).toEqual(1);
    expect(wallets[0].address).toEqual(address);
  });

  it("should generateMnemonic", async () => {
    const mnemonic = await handlers.generateMnemonic();
    expect(mnemonic.split(" ").length).toEqual(12);
  });

  it("should import mnemonic and add new account from mnemonic", async () => {
    jest.spyOn(wallet, "createDeterministicWallet").mockReturnValue(dummyHDWallet);
    jest.spyOn(wallet, "getAccountFromHDWallet").mockReturnValue(dummyAccount);
    const passphrase = "testtest";
    const mStore = new MemoryStorage();
    const createAccountHandler = methods(mStore);
    const uuid = await createAccountHandler.importMnemonic({
      mnemonic: testMnemonic,
      passphrase,
      hdPath: DEFAULT_HD_PATH,
    });
    let hdw = await mStore.getHDWallet(uuid);
    expect(hdw.uuid === uuid).toBe(true);
    let address = await createAccountHandler.getAccountFromMnemonic({
      index: 0,
      passphrase,
      uuid,
    });
    hdw = await mStore.getHDWallet(uuid);
    expect(hdw.nextAccount).toBe(0);
    expect(address).toBe(dummyAccount.address);
    address = await createAccountHandler.getAccountFromMnemonic({
      passphrase,
      uuid,
    });
    hdw = await mStore.getHDWallet(uuid);
    expect(hdw.nextAccount).toBe(1);
  });

  it("should hide and unhide account", async () => {
    await handlers.hideAccount(dummyAccount.address);
    let testWallet = await memoryStorage.getAccount(dummyAccount.address);
    expect(testWallet.visible).toBe(false);
    await handlers.unhideAccount(dummyAccount.address);

    testWallet = await memoryStorage.getAccount(dummyAccount.address);
    expect(testWallet.visible).toBe(true);
  });

  it("should sign data", async () => {
    const chainId = 61;
    const signature = await handlers.sign("hello world", dummyAccount.address, "testtest", "0x" + chainId.toString(16));
    const pubKey = sign.recoverPublicKeyFromSig(Buffer.from("hello world"), signature, chainId);
    const address = "0x" + util.keccak256(pubKey).slice(-20).toString("hex");
    expect(address).toEqual(dummyAccount.address);
  });

  it("should sign typed Data", async () => {
    const chainId = 61;
    const { signature, encodedData } = await handlers.signTypedData(typedData, dummyAccount.address, "testtest", "0x" + chainId.toString(16));
    const data = encodedData.slice(2);
    const pubKey = sign.recoverPublicKeyFromTypedData(Buffer.from(data, "hex"), signature, chainId);
    const address = "0x" + util.keccak256(pubKey).slice(-20).toString("hex");
    expect(address).toEqual(dummyAccount.address);
  });

  it("should produce signed transaction", async () => {
    const transaction: types.Transaction = {
      data: "0xf00bad",
      from: dummyAccount.address,
      gas: "0x10000",
      gasPrice: "0x100000",
      nonce: "0x01",
      to: dummyAccount.address,
      value: "0x1000000",
    };

    const chainId = 61;
    const rlpEncodedData = await handlers.signTransaction(transaction, "testtest", `0x${chainId.toString(16)}`);
    let rawData = rlp.decode(rlpEncodedData) as Buffer[];
    rawData = rawData.slice(6);
    // v,r,s
    const serialized = util.bufferToHex(sigUtil.concatSig(rawData[0], rawData[1], rawData[2]));

    const customChainParams = { name: "custom", chainId };
    const common = ethCommon.forCustomChain(1, customChainParams, "byzantium");
    const tx = new ethTx.Transaction(transaction, { common });
    const signedData = tx.hash(false);
    const pubKey = sign.recoverPublicKeyFromSigWithoutPersonal(signedData, serialized, chainId);
    const address = "0x" + util.keccak256(pubKey).slice(-20).toString("hex");
    expect(address).toEqual(dummyAccount.address);

  });

});
