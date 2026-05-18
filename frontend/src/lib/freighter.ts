/**
 * Freighter wallet integration.
 * Freighter is the official Stellar browser extension wallet.
 * https://www.freighter.app/
 */
import {
  isConnected,
  getPublicKey,
  signTransaction,
  requestAccess,
} from "@stellar/freighter-api";
import { NETWORK } from "./network";

export async function isFreighterInstalled(): Promise<boolean> {
  return isConnected();
}

export async function connectWallet(): Promise<string> {
  return requestAccess();
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    return await getPublicKey();
  } catch {
    return null;
  }
}

export async function signTx(xdr: string): Promise<string> {
  return signTransaction(xdr, {
    networkPassphrase: NETWORK.networkPassphrase,
  });
}
