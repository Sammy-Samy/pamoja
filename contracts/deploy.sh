#!/usr/bin/env bash
# deploy.sh — Build and deploy Pamoja contracts to Stellar testnet
set -euo pipefail

NETWORK="${STELLAR_NETWORK:-testnet}"
SOURCE="${STELLAR_SECRET_KEY:?Set STELLAR_SECRET_KEY}"

echo "▶ Building contracts..."
cargo build --target wasm32-unknown-unknown --release --manifest-path contracts/Cargo.toml

FACTORY_WASM="contracts/target/wasm32-unknown-unknown/release/pamoja_factory.wasm"
GROUP_WASM="contracts/target/wasm32-unknown-unknown/release/pamoja_group.wasm"

echo "▶ Uploading group wasm..."
GROUP_HASH=$(stellar contract upload \
  --wasm "$GROUP_WASM" \
  --source "$SOURCE" \
  --network "$NETWORK")
echo "  group wasm hash: $GROUP_HASH"

echo "▶ Deploying factory..."
FACTORY_ID=$(stellar contract deploy \
  --wasm "$FACTORY_WASM" \
  --source "$SOURCE" \
  --network "$NETWORK")
echo "  factory contract id: $FACTORY_ID"

echo "▶ Initialising factory..."
stellar contract invoke \
  --id "$FACTORY_ID" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$(stellar keys address "$SOURCE" --network "$NETWORK")" \
  --group_wasm_hash "$GROUP_HASH"

echo ""
echo "✅ Deployment complete!"
echo "   NEXT_PUBLIC_FACTORY_CONTRACT_ID=$FACTORY_ID"
echo "   Add the above to your .env file."
