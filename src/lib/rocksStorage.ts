import { Storage, AccountStorageData, AccountMetadata } from "./storage";
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
    let normalizedAddress = ethUtil.toChecksumAddress(address);
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
        await this.storeData(ethUtil.toChecksumAddress(wallet.address), JSON.stringify(wallet));
        return wallet;
    }
  }

  public async listWallets(type: WalletType, hidden: boolean): Promise<AccountMetadata[]> {
    const walletIdentifiers: AccountMetadata[] = [];
    const iter = this.db.iterator();
    while (true) {
      const result = await this.next(iter);
      if (result.key === undefined) {
        this.end(iter);
        return walletIdentifiers;
      }
      if (result.key && result.value) {
        const storageData = JSON.parse(result.value) as AccountStorageData;
        if (storageData.type === type && (storageData.visible || hidden)) {
          const { name, description, visible } = storageData;
          switch (storageData.type) {
            case "deterministic":
              const { uuid, hdPath } = storageData;
              walletIdentifiers.push({ uuid, name, description, type: storageData.type, hdPath, hidden: !visible });
              break;
            case "non-deterministic":
              const { address, parent } = storageData;
              walletIdentifiers.push({ address, parent, name, description, type: storageData.type, hidden: !visible });
              break;
          }
        }
      }
    }

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
      this.db.put(key, value, { sync: true }, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

}
