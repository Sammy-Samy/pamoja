"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/utils";
import { Wallet, Zap } from "lucide-react";

export function Navbar() {
  const { address, isConnecting, isInstalled, connect } = useWallet();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-stellar-dark/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <Zap className="h-5 w-5 text-brand-500" />
          Pamoja
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/groups/create" className="btn-secondary text-xs py-2 px-3">
            New Group
          </Link>

          {address ? (
            <span className="flex items-center gap-1.5 rounded-xl border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-xs font-mono text-brand-400">
              <Wallet className="h-3.5 w-3.5" />
              {shortenAddress(address)}
            </span>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting || !isInstalled}
              className="btn-primary text-xs py-2 px-3"
            >
              <Wallet className="h-3.5 w-3.5" />
              {isConnecting ? "Connecting…" : !isInstalled ? "Install Freighter" : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
