"use client";

import { useState } from "react";
import { createGroup, Member } from "@/lib/contracts";
import { useWallet } from "./useWallet";

export function useCreateGroup() {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(name: string, members: Member[]): Promise<string | null> {
    if (!address) {
      setError("Wallet not connected");
      return null;
    }
    setIsLoading(true);
    setError(null);
    try {
      const contractId = await createGroup(address, name, members);
      return contractId;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { create, isLoading, error };
}
