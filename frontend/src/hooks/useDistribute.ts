"use client";

import { useState } from "react";
import { distributePayment } from "@/lib/contracts";
import { useWallet } from "./useWallet";

export function useDistribute() {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function distribute(
    groupContractId: string,
    tokenAddress: string,
    amount: bigint
  ): Promise<boolean> {
    if (!address) {
      setError("Wallet not connected");
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      await distributePayment(address, groupContractId, tokenAddress, amount);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { distribute, isLoading, error };
}
