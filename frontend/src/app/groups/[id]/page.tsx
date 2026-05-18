"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Copy, Send, Users } from "lucide-react";
import { getGroupMembers } from "@/lib/contracts";
import { useDistribute } from "@/hooks/useDistribute";
import { useWallet } from "@/hooks/useWallet";
import { bpsToPercent, shortenAddress } from "@/lib/utils";

// XLM native token address on Stellar
const XLM_TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { address } = useWallet();
  const { distribute, isLoading } = useDistribute();

  const [members, setMembers] = useState<Record<string, number>>({});
  const [amount, setAmount] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    if (!id) return;
    getGroupMembers(id)
      .then(setMembers)
      .catch(() => toast.error("Failed to load group"))
      .finally(() => setLoadingMembers(false));
  }, [id]);

  async function handleDistribute(e: React.FormEvent) {
    e.preventDefault();
    const stroops = BigInt(Math.round(parseFloat(amount) * 10_000_000));
    const ok = await distribute(id, XLM_TOKEN, stroops);
    if (ok) {
      toast.success("Payment distributed!");
      setAmount("");
    } else {
      toast.error("Distribution failed");
    }
  }

  function copyAddress() {
    navigator.clipboard.writeText(id);
    toast.success("Address copied");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-white">Payment Group</h1>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-slate-400">{shortenAddress(id, 8)}</span>
          <button onClick={copyAddress} className="text-slate-500 hover:text-brand-400 transition">
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="card mb-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-brand-400" />
          <h2 className="font-semibold text-white">Members</h2>
        </div>

        {loadingMembers ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-800" />
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {Object.entries(members).map(([addr, bps]) => (
              <li
                key={addr}
                className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-2.5"
              >
                <span className="font-mono text-sm text-slate-300">{shortenAddress(addr, 6)}</span>
                <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-semibold text-brand-400">
                  {bpsToPercent(bps)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Distribute */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <Send className="h-4 w-4 text-brand-400" />
          <h2 className="font-semibold text-white">Send Payment</h2>
        </div>
        <form onSubmit={handleDistribute} className="space-y-4">
          <div>
            <label className="label">Amount (XLM)</label>
            <input
              className="input"
              type="number"
              min="0.0000001"
              step="any"
              placeholder="10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={!address || isLoading || !amount}
            className="btn-primary w-full justify-center py-3"
          >
            <Send className="h-4 w-4" />
            {isLoading ? "Distributing…" : "Distribute Payment"}
          </button>
          {!address && (
            <p className="text-center text-sm text-slate-500">Connect your wallet to send</p>
          )}
        </form>
      </div>
    </div>
  );
}
