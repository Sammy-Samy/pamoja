"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Users } from "lucide-react";
import { useCreateGroup } from "@/hooks/useCreateGroup";
import { useWallet } from "@/hooks/useWallet";

interface MemberRow {
  address: string;
  percent: string; // user types %, we convert to bps
}

export default function CreateGroupPage() {
  const router = useRouter();
  const { address } = useWallet();
  const { create, isLoading } = useCreateGroup();

  const [name, setName] = useState("");
  const [members, setMembers] = useState<MemberRow[]>([
    { address: "", percent: "50" },
    { address: "", percent: "50" },
  ]);

  const totalPercent = members.reduce((s, m) => s + (parseFloat(m.percent) || 0), 0);
  const isValid =
    name.trim().length > 0 &&
    members.every((m) => m.address.trim().length > 0 && parseFloat(m.percent) > 0) &&
    Math.abs(totalPercent - 100) < 0.01;

  function addMember() {
    setMembers((prev) => [...prev, { address: "", percent: "0" }]);
  }

  function removeMember(i: number) {
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateMember(i: number, field: keyof MemberRow, value: string) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    const contractMembers = members.map((m) => ({
      address: m.address.trim(),
      bps: Math.round(parseFloat(m.percent) * 100),
    }));
    const contractId = await create(name.trim(), contractMembers);
    if (contractId) {
      toast.success("Group created!");
      router.push(`/groups/${contractId}`);
    } else {
      toast.error("Failed to create group");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create Payment Group</h1>
        <p className="mt-1 text-slate-400">
          Set up member wallets and percentage splits. Total must equal 100%.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group name */}
        <div>
          <label className="label">Group Name</label>
          <input
            className="input"
            placeholder="e.g. Design Team, Chama Fund"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Members */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="label mb-0">Members</label>
            <span
              className={`text-xs font-semibold ${
                Math.abs(totalPercent - 100) < 0.01 ? "text-brand-400" : "text-red-400"
              }`}
            >
              Total: {totalPercent.toFixed(2)}%
            </span>
          </div>

          <div className="space-y-3">
            {members.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="G... Stellar address"
                  value={m.address}
                  onChange={(e) => updateMember(i, "address", e.target.value)}
                  required
                />
                <div className="relative w-24">
                  <input
                    className="input pr-6 text-right"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    value={m.percent}
                    onChange={(e) => updateMember(i, "percent", e.target.value)}
                    required
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    %
                  </span>
                </div>
                {members.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeMember(i)}
                    className="rounded-xl border border-slate-700 p-2.5 text-slate-400 hover:border-red-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addMember}
            className="mt-3 flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition"
          >
            <Plus className="h-4 w-4" /> Add member
          </button>
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading || !address}
          className="btn-primary w-full justify-center py-3"
        >
          <Users className="h-4 w-4" />
          {isLoading ? "Creating on-chain…" : "Create Group"}
        </button>

        {!address && (
          <p className="text-center text-sm text-slate-500">Connect your wallet to continue</p>
        )}
      </form>
    </div>
  );
}
