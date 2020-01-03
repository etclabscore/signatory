// tslint:disable-next-line:variable-name
import * as ethUtil from "ethereumjs-util";
// tslint:disable-next-line:no-var-requires
const sigUtil = require("eth-sig-util");
const { TypedDataUtils } = sigUtil;
import { TypedData, Transaction } from "../generated-types";
import * as ethTx from "ethereumjs-tx";
import ethCommon from "ethereumjs-common";

// retutrns signature
export const personalSign = (message: Buffer, privateKey: Buffer, chainID: number) => {
  const msgHash = ethUtil.hashPersonalMessage(message);
  const sig = ethUtil.ecsign(msgHash, privateKey, chainID);
  const serialized = ethUtil.bufferToHex(sigUtil.concatSig(sig.v, sig.r, sig.s));
  return serialized;
};

export const hashSignTypedData = (data: TypedData): Buffer => {
  return TypedDataUtils.sign(data);
};

export const signTypedData = (data: TypedData, privateKey: Buffer, chainID: number) => {
  const dataToSign = TypedDataUtils.sign(data);
  const sig = ethUtil.ecsign(dataToSign, privateKey, chainID);
  const serialized = ethUtil.bufferToHex(sigUtil.concatSig(sig.v, sig.r, sig.s));
  return { signature: serialized, data: dataToSign };
};

export const signTransaction = (transaction: Transaction, privateKey: Buffer, chainId: number) => {

  const customChainParams = { name: "custom", chainId };
  const common = ethCommon.forCustomChain(1, customChainParams, "byzantium");
  const tx = new ethTx.Transaction(transaction, { common });
  tx.sign(privateKey);
  const serializedTx = tx.serialize();
  return "0x" + serializedTx.toString("hex");
};

export const recoverPublicKeyFromSigWithoutPersonal = (msgHash: Buffer, sig: string, chainID: number) => {
  const sigParams = ethUtil.fromRpcSig(sig);
  return ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s, chainID);
};

export const recoverPublicKeyFromSig = (message: Buffer, sig: string, chainID: number) => {
  const sigParams = ethUtil.fromRpcSig(sig);
  const msgHash = ethUtil.hashPersonalMessage(message);
  return ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s, chainID);
};

export const recoverPublicKeyFromTypedData = (typedDataHash: Buffer, sig: string, chainID: number) => {
  const sigParams = ethUtil.fromRpcSig(sig);
  return ethUtil.ecrecover(typedDataHash, sigParams.v, sigParams.r, sigParams.s, chainID);
};
