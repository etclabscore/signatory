import * as sign from "./sign";
import * as util from "ethereumjs-util";
import { TypedData } from "../generated-types";
describe("Signing transactions", () => {
  let typedData: TypedData;
  beforeAll(() => {
    typedData = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" },

        ],
      },
      primaryType: "Mail",
      domain: {
        name: "Ether Mail",
        version: "1",
        chainId: 1,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      },
      message: {
        from: {
          name: "Cow",
          wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        },
        to: {
          name: "Bob",
          wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        },
        contents: "Hello, Bob!",
      },
    };
  });

  it("it should sign and recover a transaction", () => {
    const privateKey = Buffer.alloc(32, 1);
    const expectedPublicKey = util.privateToPublic(privateKey);
    const message = Buffer.from("ok");
    const signed = sign.personalSign(message, privateKey, 61);
    const publicKey = sign.recoverPublicKeyFromSig(message, signed, 61);
    expect(publicKey).toEqual(expectedPublicKey);
  });

  it("it should sign and recover a signed typed data transaction", () => {
    const privateKey = util.keccak256("cow");
    const address = util.privateToAddress(privateKey);
    const hash = sign.hashSignTypedData(typedData);
    const { signature } = sign.signTypedData(typedData, privateKey, 1);
    const pubKey = sign.recoverPublicKeyFromTypedData(hash, signature, 1);
    const expectedPublickKey = util.privateToPublic(privateKey);
    expect(pubKey.toString("hex")).toEqual(expectedPublickKey.toString("hex"));

  });

});
