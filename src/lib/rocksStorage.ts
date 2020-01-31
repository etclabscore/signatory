import { Storage, AccountStorageData } from "./storage";
import { WalletType, NonDeterministicWallet, DeterministicWallet } from "./wallet";
import * as ethUtil from "ethereumjs-util";
import RocksDB from "rocksdb";

export class RocksStorage implements Storage {
  private db: RocksDB;
  private path: string;

  constructor(path: string) {
    this.path = path;
    this.db = RocksDB(this.path);

  }

  public open(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.open({ infoLogLevel: "debug" }, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
  public async getAccount(address: string): Promise<NonDeterministicWallet> {
    let normalizedAddress = address.toLowerCase();
    if (ethUtil.isZeroAddress(normalizedAddress)) {
      normalizedAddress = normalizedAddress.slice(2);
    }
    const accountStorageBuffer = await this.getData(normalizedAddress);
    const accountStorageJSON = accountStorageBuffer.toString("utf-8");
    return JSON.parse(accountStorageJSON) as NonDeterministicWallet;
  }

  public async getHDWallet(uuid: string): Promise<DeterministicWallet> {
    const accountStorageBuffer = await this.getData(uuid.toLowerCase());
    const accountStorageJSON = accountStorageBuffer.toString("utf-8");
    return JSON.parse(accountStorageJSON) as DeterministicWallet;
  }

  public async storeAccount(wallet: AccountStorageData): Promise<AccountStorageData> {
    switch (wallet.type) {
      case "deterministic":
        await this.storeData(wallet.uuid.toLowerCase(), JSON.stringify(wallet));
        return wallet;
      case "non-deterministic":
        await this.storeData(wallet.address.toLowerCase(), JSON.stringify(wallet));
        return wallet;
    }
  }

  public async listWallets(type: WalletType): Promise<string[]> {
    const walletIdentifiers: string[] = [];
    const iter = this.db.iterator();
    while (iter.finished === false) {
      const result = await this.next(iter);
      if (result.key && result.value) {
        const storageData = JSON.parse(result.value) as AccountStorageData;
        if (storageData.type === type && storageData.visible) {
          switch (storageData.type) {
            case "deterministic":
              walletIdentifiers.push(storageData.uuid);
              break;
            case "non-deterministic":
              walletIdentifiers.push(storageData.address);
              break;
          }
        }
      }
    }
    await this.end(iter);
    return walletIdentifiers;
  }

  private next(it: RocksDB.Iterator): Promise<any> {
    return new Promise((resolve, reject) => {
      it.next((err, key, value) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ key, value });
      });
    });
  }

  private end(it: RocksDB.Iterator): Promise<void> {
    return new Promise((resolve, reject) => {
      it.end((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  private async getData(key: RocksDB.Bytes): Promise<RocksDB.Bytes> {
    return new Promise((resolve, reject) => {

      this.db.get(key, (err, value) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(value);
      });
    });
  }

  private async storeData(key: RocksDB.Bytes, value: RocksDB.Bytes): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.put(key, value, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

}
