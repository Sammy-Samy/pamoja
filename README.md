# Pamoja 🌍

> Revolutionizing group payments on Stellar — Built for Africa 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/pamoja-app/pamoja/actions/workflows/ci.yml/badge.svg)](https://github.com/pamoja-app/pamoja/actions/workflows/ci.yml)
[![Stellar](https://img.shields.io/badge/Stellar-Soroban-blue)](https://soroban.stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)

Pamoja automates group payment distribution using Stellar Soroban smart contracts. Create a group, assign wallet addresses with percentage splits, and any payment sent to your group contract instantly distributes funds — no manual calculations, no delays, complete on-chain transparency.

**Built by Africans to solve African payment problems: Simple, Seamless, Secure.**

---

## ✨ Features

- **Group Creation** — Set up payment groups with multiple Stellar wallet addresses and percentage splits
- **Child Contracts** — Each group deploys its own Soroban child contract; funds split exactly as configured
- **Automated Distribution** — Payments split and distribute instantly on-chain, zero manual intervention
- **Group Management** — Update splits, extend usage limits, manage subscription cycles
- **Full Transparency** — On-chain transaction history, distribution logs, real-time tracking

## 🏗️ Architecture

```
pamoja/
├── contracts/          # Soroban smart contracts (Rust)
│   ├── pamoja_factory/   # Factory contract — deploys group child contracts
│   └── pamoja_group/     # Group contract — holds splits, executes distribution
├── frontend/           # Next.js 14 app
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Stellar SDK hooks
│   │   └── lib/           # SDK clients, contract bindings
│   └── public/
├── .github/workflows/  # CI/CD
└── docker/             # Deployment
```

## 🚀 Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) + `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-stellar-cli) (`stellar`)
- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+

### 1. Clone & install

```bash
git clone https://github.com/pamoja-app/pamoja.git
cd pamoja
cp .env.example .env
```

### 2. Build & deploy contracts

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/pamoja_factory.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet
```

### 3. Run the frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🔧 Environment Variables

See [`.env.example`](./.env.example) for all required variables.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `mainnet` |
| `NEXT_PUBLIC_FACTORY_CONTRACT_ID` | Deployed factory contract address |
| `NEXT_PUBLIC_HORIZON_URL` | Horizon server URL |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | Soroban RPC endpoint |

## 🧪 Testing

```bash
# Contract tests
cd contracts
cargo test

# Frontend tests
cd frontend
pnpm test

# E2E
pnpm test:e2e
```

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting a PR.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/)
4. Open a Pull Request

## 📜 License

[MIT](./LICENSE) © 2026 Pamoja Contributors

## 🌍 Community

- [Discord](https://discord.gg/pamoja)
- [Twitter / X](https://twitter.com/pamoja_app)
- [Stellar Developer Discord](https://discord.gg/stellardev)
