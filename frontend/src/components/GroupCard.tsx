import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

interface GroupCardProps {
  contractId: string;
  name: string;
}

export function GroupCard({ contractId, name }: GroupCardProps) {
  return (
    <Link
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
  );
}
