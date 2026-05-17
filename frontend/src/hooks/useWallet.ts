"use client";

import { useEffect } from "react";
import { useWalletStore } from "@/store/wallet";

export function useWallet() {
  const { address, isConnecting, isInstalled, connect, disconnect, init } = useWalletStore();

  useEffect(() => {
    init();
  }, [init]);

  return { address, isConnecting, isInstalled, connect, disconnect };
}
