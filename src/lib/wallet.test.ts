import * as wallet from "./wallet";
import _ from "lodash";
import Wallet from "@etclabscore/ethereumjs-wallet";
describe("wallet functionaity", () => {
  it("should create non deterministic wallet retrieve private key", () => {
    const privKey = "0x7a28b5ba57c53603b0b07b56bba752f7784bf506fa95edc395f5cf6c7514fe9d";
    const privateKey = Buffer.from(privKey.slice(2), "hex");
    const w = wallet.createNonDeterministicWallet({ passphrase: "testpassword", privateKey }, undefined);
    const priv = wallet.exportPrivateKey("testpassword", w.keystore);
    expect(_.isEqual(priv, privKey));
  });

  it("should create deterministic wallet retrieve seed phrase", () => {
    const passphrase = "testpassword";
    const seed = Buffer.alloc(32).fill(1);
    const w = wallet.createDeterministicWallet(passphrase, seed, wallet.DEFAULT_HD_PATH);
    const walletSeed = Wallet.fromV3Data(w.keystore, passphrase);
    expect(_.isEqual(walletSeed, seed));
  });
});
