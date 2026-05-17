import { SorobanRpc } from "@stellar/stellar-sdk";
import { NETWORK } from "./network";

let _server: SorobanRpc.Server | null = null;

export function getSorobanServer(): SorobanRpc.Server {
  if (!_server) {
    _server = new SorobanRpc.Server(NETWORK.sorobanRpcUrl, { allowHttp: false });
  }
  return _server;
}
