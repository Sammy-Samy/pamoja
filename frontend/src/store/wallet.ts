import { create } from "zustand";
import { connectWallet, getWalletAddress, isFreighterInstalled } from "@/lib/freighter";

interface WalletState {
  address: string | null;
  isConnecting: boolean;
  isInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  init: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnecting: false,
  isInstalled: false,

  init: async () => {
    const installed = await isFreighterInstalled();
    set({ isInstalled: installed });
    if (installed) {
      const address = await getWalletAddress();
      set({ address });
    }
  },

  connect: async () => {
    set({ isConnecting: true });
    try {
      const address = await connectWallet();
      set({ address });
    } finally {
      set({ isConnecting: false });
    }
  },

  disconnect: () => set({ address: null }),
}));
