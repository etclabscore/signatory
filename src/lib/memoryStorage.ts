import { Storage, AccountStorageData, AccountMetadata } from "./storage";
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

  public listWallets(type: WalletType, hidden: boolean): Promise<AccountMetadata[]> {
    const wallets = Object.keys(this.storage).map((key) => JSON.parse(this.storage[key]) as AccountStorageData);
    const filteredWallets = wallets.filter((wallet) => wallet.type === type && (wallet.visible || hidden));
    return Promise.resolve(filteredWallets.map((wallet) => {
      const { name, description, visible } = wallet;
      switch (wallet.type) {
        case "non-deterministic":
          const { address, parent } = wallet;
          return { address, parent, name, description, type: wallet.type, hidden: !visible };
        case "deterministic":
          const { uuid, hdPath } = wallet;
          return { uuid, name, description, hdPath, type: wallet.type, hidden: !visible };
      }
    }));
  }

  private getEntry(key: string) {
    return this.storage[key];
  }
}
