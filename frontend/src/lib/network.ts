import { Networks } from "@stellar/stellar-sdk";

export type StellarNetwork = "testnet" | "mainnet";

const network = (process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet") as StellarNetwork;

export const NETWORK_CONFIG = {
  testnet: {
    networkPassphrase: Networks.TESTNET,
    horizonUrl: "https://horizon-testnet.stellar.org",
    sorobanRpcUrl: "https://soroban-testnet.stellar.org",
  },
  mainnet: {
    networkPassphrase: Networks.PUBLIC,
    horizonUrl: "https://horizon.stellar.org",
    sorobanRpcUrl: "https://mainnet.sorobanrpc.com",
  },
} as const;

export const ACTIVE_NETWORK = network;
export const NETWORK = NETWORK_CONFIG[network];
export const FACTORY_CONTRACT_ID = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID ?? "";
