import { Injected } from "./connectors";

/* EIP-3085 */
export interface Chain {
  chainId: string;
  blockExplorerUrls?: string[];
  chainName?: string;
  iconUrls?: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls?: string[];
}

declare global{
  interface Window {
    ethereum?: EIP1193Provider
  }
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent
  }
}

/* EIP-6963 */
export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export type EIP6963AnnounceProviderEvent = {
  detail:{
    info: EIP6963ProviderInfo,
    provider: EIP1193Provider
  }
}

/* EIP-1193 */
interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export interface EIP1193Provider {
  request:<T>(args: RequestArguments) => Promise<T>
  on: (event: string , listener: (event: any) => void)=>void
  removeListener:(event: string , listener: (event: any) => void)=>void
}

export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

/* extended Provider */
export interface Provider extends EIP1193Provider {
  connect?:()=> Promise<unknown>
  disconnect?: ()=> unknown
}

/* W3 */
export type Connector = Injected