import { Storage, AccountStorageData } from "./storage";
import { WalletType, DeterministicWallet, NonDeterministicWallet } from "./wallet";
export class MemoryStorage implements Storage {
  public storage: { [key: string]: string; };

  constructor() {
    this.storage = {};
  }

  public open(): Promise<void> {
    return Promise.resolve();
  }

  public close(): Promise<void> {
    return Promise.resolve();
  }

  public getAccount(address: string): Promise<NonDeterministicWallet> {
    return Promise.resolve(JSON.parse(this.getEntry(address)) as NonDeterministicWallet);
  }

  public getHDWallet(uuid: string) {
    return Promise.resolve(JSON.parse(this.getEntry(uuid)) as DeterministicWallet);
  }

  public storeAccount(wallet: AccountStorageData): Promise<AccountStorageData> {
    const serializedWallet = JSON.stringify(wallet);
    switch (wallet.type) {
      case "deterministic":
        this.storage[wallet.uuid] = serializedWallet;
        break;
      case "non-deterministic":
        this.storage[wallet.address] = serializedWallet;
        break;
    }
    return Promise.resolve(wallet);
  }

  public listWallets(type: WalletType): Promise<string[]> {
    const wallets = Object.keys(this.storage).map((key) => JSON.parse(this.storage[key]) as AccountStorageData);
    const filteredWallets = wallets.filter((wallet) => wallet.type === type && wallet.visible);
    return Promise.resolve(filteredWallets.map((wallet) => {
      switch (wallet.type) {
        case "non-deterministic":
          return wallet.address;
        case "deterministic":
          return wallet.uuid;
      }
    }));
  }

  private getEntry(key: string) {
    return this.storage[key];
  }
}
