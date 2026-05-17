import Link from "next/link";
import { ArrowRight, Globe, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Distribution",
    desc: "Payments split and sent to all members in a single on-chain transaction.",
  },
  {
    icon: Shield,
    title: "Trustless & Transparent",
    desc: "Soroban smart contracts enforce splits exactly as configured — no middlemen.",
  },
  {
    icon: Globe,
    title: "Built for Africa",
    desc: "Designed for chamas, freelancer collectives, and cross-border teams.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      {/* Hero */}
      <div className="mb-20 text-center">
        <span className="mb-4 inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-400">
          Built on Stellar Soroban
        </span>
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
          Group Payments,{" "}
          <span className="bg-gradient-to-r from-brand-400 to-stellar-blue bg-clip-text text-transparent">
            Automated
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
          Create a payment group, set wallet addresses with percentage splits, and any payment sent
          to your group contract instantly distributes funds — no manual calculations, complete
          transparency.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/groups/create" className="btn-primary text-base px-8 py-3">
            Create a Group <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/dashboard" className="btn-secondary text-base px-8 py-3">
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card">
            <div className="mb-4 inline-flex rounded-xl bg-brand-500/10 p-3">
              <Icon className="h-6 w-6 text-brand-400" />
            </div>
            <h3 className="mb-2 font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mt-24 text-center">
        <h2 className="mb-12 text-3xl font-bold text-white">How it works</h2>
        <ol className="mx-auto grid max-w-3xl gap-6 text-left md:grid-cols-3">
          {[
            { step: "01", title: "Create a Group", desc: "Add member wallets and set percentage splits that total 100%." },
            { step: "02", title: "Share Your Address", desc: "Your group gets a unique Soroban contract address. Share it with payers." },
            { step: "03", title: "Funds Auto-Split", desc: "Every payment triggers instant on-chain distribution to all members." },
          ].map(({ step, title, desc }) => (
            <li key={step} className="card">
              <span className="mb-3 block text-3xl font-black text-brand-500/40">{step}</span>
              <h4 className="mb-1 font-semibold text-white">{title}</h4>
              <p className="text-sm text-slate-400">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
