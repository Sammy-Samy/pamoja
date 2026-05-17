"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Plus, Wallet } from "lucide-react";
import { getSorobanServer } from "@/lib/soroban";
import { FACTORY_CONTRACT_ID, NETWORK } from "@/lib/network";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/utils";
import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  SorobanRpc,
  scValToNative,
} from "@stellar/stellar-sdk";

interface GroupEntry {
  contractId: string;
  name: string;
}

async function fetchGroups(): Promise<GroupEntry[]> {
  if (!FACTORY_CONTRACT_ID) return [];
  const server = getSorobanServer();
  const contract = new Contract(FACTORY_CONTRACT_ID);
  // Use a dummy account for read-only simulation
  const account = await server.getAccount(FACTORY_CONTRACT_ID).catch(() => null);
  if (!account) return [];

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK.networkPassphrase,
  })
    .addOperation(contract.call("get_groups"))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) return [];
  const success = sim as SorobanRpc.Api.SimulateTransactionSuccessResponse;
  const raw = scValToNative(success.result!.retval) as Record<string, string>;
  return Object.entries(raw).map(([contractId, name]) => ({ contractId, name }));
}

export default function DashboardPage() {
  const { address, connect, isInstalled } = useWallet();
  const [groups, setGroups] = useState<GroupEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups()
      .then(setGroups)
      .catch(() => toast.error("Failed to load groups"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          {address && (
            <p className="mt-1 font-mono text-sm text-slate-400">{shortenAddress(address, 8)}</p>
          )}
        </div>
        <Link href="/groups/create" className="btn-primary">
          <Plus className="h-4 w-4" /> New Group
        </Link>
      </div>

      {!address ? (
        <div className="card flex flex-col items-center gap-4 py-16 text-center">
          <Wallet className="h-12 w-12 text-slate-600" />
          <p className="text-slate-400">Connect your wallet to view your groups</p>
          <button onClick={connect} disabled={!isInstalled} className="btn-primary">
            Connect Wallet
          </button>
        </div>
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-800" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-slate-400">No groups yet.</p>
          <Link href="/groups/create" className="btn-primary">
            Create your first group
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map(({ contractId, name }) => (
            <Link
              key={contractId}
              href={`/groups/${contractId}`}
              className="card group flex flex-col justify-between hover:border-brand-500/50 transition"
            >
              <div>
                <h3 className="mb-1 font-semibold text-white">{name}</h3>
                <p className="font-mono text-xs text-slate-500">{shortenAddress(contractId, 6)}</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-brand-400 group-hover:gap-2 transition-all">
                View group <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
