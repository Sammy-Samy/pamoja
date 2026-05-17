/**
 * Freighter wallet integration.
 * Freighter is the official Stellar browser extension wallet.
 * https://www.freighter.app/
 */
import {
  isConnected,
  getAddress,
  signTransaction,
  requestAccess,
} from "@stellar/freighter-api";
import { NETWORK } from "./network";

export async function isFreighterInstalled(): Promise<boolean> {
  const result = await isConnected();
  return result.isConnected;
}

export async function connectWallet(): Promise<string> {
  const access = await requestAccess();
  if (access.error) throw new Error(access.error);
  return access.address;
}

export async function getWalletAddress(): Promise<string | null> {
  const result = await getAddress();
  if (result.error) return null;
  return result.address;
}

export async function signTx(xdr: string): Promise<string> {
  const result = await signTransaction(xdr, {
    networkPassphrase: NETWORK.networkPassphrase,
  });
  if (result.error) throw new Error(result.error);
  return result.signedTxXdr;
}
