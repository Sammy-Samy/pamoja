/**
 * Low-level helpers for invoking Pamoja Soroban contracts.
 * Builds, simulates, and submits transactions.
 */
import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  SorobanRpc,
  nativeToScVal,
  Address,
  scValToNative,
} from "@stellar/stellar-sdk";
import { getSorobanServer } from "./soroban";
import { NETWORK, FACTORY_CONTRACT_ID } from "./network";
import { signTx } from "./freighter";

export interface Member {
  address: string;
  bps: number; // basis points, total must = 10_000
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function buildAndSubmit(
  callerAddress: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[]
): Promise<unknown> {
  const server = getSorobanServer();
  const account = await server.getAccount(callerAddress);

  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }

  const preparedTx = SorobanRpc.assembleTransaction(tx, simResult).build();
  const signedXdr = await signTx(preparedTx.toXDR());

  const sendResult = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, NETWORK.networkPassphrase)
  );
  if (sendResult.status === "ERROR") {
    throw new Error(`Submit failed: ${sendResult.errorResult?.toXDR()}`);
  }

  // Poll for confirmation
  let getResult = await server.getTransaction(sendResult.hash);
  while (getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise((r) => setTimeout(r, 1500));
    getResult = await server.getTransaction(sendResult.hash);
  }

  if (getResult.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
    throw new Error("Transaction failed on-chain");
  }

  const successResult = getResult as SorobanRpc.Api.GetSuccessfulTransactionResponse;
  return successResult.returnValue ? scValToNative(successResult.returnValue) : null;
}

// ── Factory ───────────────────────────────────────────────────────────────────

export async function createGroup(
  callerAddress: string,
  name: string,
  members: Member[]
): Promise<string> {
  const membersScVal = xdr.ScVal.scvVec(
    members.map((m) =>
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: nativeToScVal("address"),
          val: new Address(m.address).toScVal(),
        }),
        new xdr.ScMapEntry({
          key: nativeToScVal("bps"),
          val: nativeToScVal(m.bps, { type: "u32" }),
        }),
      ])
    )
  );

  const result = await buildAndSubmit(callerAddress, FACTORY_CONTRACT_ID, "create_group", [
    new Address(callerAddress).toScVal(),
    nativeToScVal(name, { type: "string" }),
    membersScVal,
  ]);

  return result as string;
}

// ── Group ─────────────────────────────────────────────────────────────────────

export async function distributePayment(
  callerAddress: string,
  groupContractId: string,
  tokenAddress: string,
  amount: bigint
): Promise<void> {
  await buildAndSubmit(callerAddress, groupContractId, "distribute", [
    new Address(callerAddress).toScVal(),
    new Address(tokenAddress).toScVal(),
    nativeToScVal(amount, { type: "i128" }),
  ]);
}

export async function getGroupMembers(
  groupContractId: string
): Promise<Record<string, number>> {
  const server = getSorobanServer();
  const contract = new Contract(groupContractId);
  const account = await server.getAccount(groupContractId); // read-only sim
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK.networkPassphrase,
  })
    .addOperation(contract.call("get_members"))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) throw new Error(sim.error);
  const simSuccess = sim as SorobanRpc.Api.SimulateTransactionSuccessResponse;
  return scValToNative(simSuccess.result!.retval) as Record<string, number>;
}
