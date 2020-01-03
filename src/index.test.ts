import * as signatory from "@etclabscore/signatory-client";
import { startSignatory } from "./index";
import { SignatoryServer } from "./lib/signatoryServer";
import net, { AddressInfo } from "net";
import fs from "fs-extra";
import testTypedData from "./fixtures/typedData.json";
import rimraf from "rimraf";
import { promisify } from "util";
import { randomBytes } from "crypto";
import { RocksStorage } from "./lib/rocksStorage";

const getFreePort = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => {
        resolve(port);
      });
    });
  });
};

describe("Integration test for signatory server", () => {

  let client: signatory.SignatoryClient;
  let server: SignatoryServer;
  let serverDir: string;
  let storage: RocksStorage;

  beforeAll(async () => {

    const serverPort = await getFreePort();
    serverDir = await fs.mkdtemp("test-signatory");
    storage = new RocksStorage(serverDir);
    server = await startSignatory(storage, `${serverPort}`);
    client = new signatory.SignatoryClient({
      transport: {
        host: "localhost",
        port: serverPort,
        type: "http",
      },
    });
  });

  afterEach(async () => {
    await storage.close();
    await promisify(rimraf)(serverDir);
    await storage.open();
  });

  afterAll(async () => {
    await server.storage.close();
    await promisify(rimraf)(serverDir);
  });

  it("should create account and sign data with account from mnemonic", async () => {
    const mnemonic = await client.generateMnemonic();
    const uuid = await client.importMnemonic({
      hdPath: `m/44’/61’/0’/0`,
      passphrase: "testtest",
      mnemonic,
    });
    expect(mnemonic).toBeDefined();
    const generateAccountFromMnemonic = async (index: number, id: string) => {
      return client.getAccountFromMnemonic({
        index,
        uuid: id,
        passphrase: "testtest",
      });
    };
    const address0 = await generateAccountFromMnemonic(0, uuid);
    const address1 = await generateAccountFromMnemonic(1, uuid);
    const address00 = await generateAccountFromMnemonic(0, uuid);
    expect(address0).toEqual(address00);
    expect(address1 === address0).toBe(false);
    await client.hideAccount(address0);
    await client.hideAccount(address1);
    await client.hideAccount(address00);
  });

  it("should create account ,  export and  import a keyfile", async () => {

    const address = await client.createAccount({
      description: "test account",
      name: "test account name",
      passphrase: "testtest",
    });

    const keyfile = await client.exportAccount(address);
    const importedAddress = await client.importKeyfile("testtest", keyfile);
    expect(address).toEqual(importedAddress);
    let addresses = await client.listAccounts();
    expect(addresses.length).toBe(1);
    expect(addresses[0].address).toEqual(address);
    await client.hideAccount(address);
    addresses = await client.listAccounts();
    expect(addresses.length).toBe(0);
    await client.unhideAccount(address);
    addresses = await client.listAccounts();
    expect(addresses.length).toBe(1);
    await client.hideAccount(address);

  });

  it("should create an account and sign data with the account", async () => {
    const address = await client.createAccount({
      description: "test account",
      name: "test account name",
      passphrase: "testtest",
    });
    const importedAddress = await client.createAccount({ passphrase: "testtest", privateKey: randomBytes(32).toString("hex") });
    expect(importedAddress).toBeDefined();
    expect(importedAddress === address).toBe(false);
    const signedTx = await client.signTransaction({
      from: address,
      to: address,
      value: "0x10",
      gas: "0x1000000",
      gasPrice: "0x10",
      nonce: "0x01",
    }, "testtest", 61);
    expect(signedTx).toBeDefined();

    const signTypedData = await client.signTypedData(testTypedData, address, "testtest", 6);
    expect(signTypedData.signature).toBeDefined();
    expect(signTypedData.encodedData).toBeDefined();
  });

});
