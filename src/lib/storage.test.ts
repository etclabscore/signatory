import { MemoryStorage } from "./memoryStorage";
import { RocksStorage } from "./rocksStorage";
import { Storage } from "./storage";
import { mkdtempSync } from "fs-extra";
import rimraf = require("rimraf");
import { createNonDeterministicWallet, createDeterministicWallet, DEFAULT_HD_PATH, DeterministicWallet, NonDeterministicWallet } from "./wallet";
import _ from "lodash";
import dWallet from "../fixtures/wallet.json";
import ndWallet from "../fixtures/ndwallet.json";
describe("Wallet Storage test", () => {
  let storage: Storage[];
  let storageDir: string;
  let hdWallet: DeterministicWallet;
  let privWallet: NonDeterministicWallet;
  const privateKey = Buffer.alloc(32).fill(1);
  const passphrase = "testpass";
  beforeAll(() => {
    hdWallet = dWallet as DeterministicWallet;
    privWallet = ndWallet as NonDeterministicWallet;
  });

  beforeEach(async () => {
    storageDir = mkdtempSync("signatory-test");
    storage = [new MemoryStorage(), new RocksStorage(storageDir)];
    await Promise.all(storage.map(async (store) => store.open()));
  });

  afterEach(async (done) => {
    await Promise.all(storage.map(async (store) => store.close()));
    rimraf(storageDir, done);
  });

  it("should store and retrieve wallets", async () => {
    await Promise.all(storage.map(async (store) => {
      await store.storeAccount(hdWallet);
      await store.storeAccount(privWallet);
      const pWallet = await store.getAccount(privWallet.address);
      const hWallet = await store.getHDWallet(hdWallet.uuid);
      expect(_.isEqual(pWallet, privWallet));

      expect(_.isEqual(hWallet, hdWallet));
    }));

  });

  it("should list wallets and hd wallets", async () => {
    await Promise.all(storage.map(async (store) => {
      await store.storeAccount(hdWallet);
      await store.storeAccount(privWallet);
      const accounts = await store.listWallets("non-deterministic");
      expect(accounts.length === 1).toBe(true);
      expect(accounts[0]).toEqual(privWallet.address);

      const wallets = await store.listWallets("deterministic");
      expect(wallets.length === 1).toBe(true);
      expect(wallets[0]).toEqual(hdWallet.uuid);

    }));
  });
});
