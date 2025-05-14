import { Injected } from './connectors'
import type {
  Abi,
  ExtractAbiFunctionNames,
  ExtractAbiFunction,
  AbiParametersToPrimitiveTypes,
	ExtractAbiEventNames,
	ExtractAbiEvent,
} from 'abitype'

export type InitConfig = { connectors: Connector[]; defaultChain?: Chain | number; SSR?: Boolean, chains: Chain[] }

/* EIP-3085 */
export interface Chain {
	chainId: string
	blockExplorerUrls?: string[]
	chainName?: string
	iconUrls?: string[]
	nativeCurrency?: {
		name: string
		symbol: string
		decimals: number
	}
	rpcUrls?: string[]
}

declare global {
	interface Window {
		ethereum?: EIP1193Provider
	}
	interface WindowEventMap {
		'eip6963:announceProvider': CustomEvent
	}
}

/* EIP-6963 */
export interface EIP6963ProviderDetail {
	info: EIP6963ProviderInfo
	provider: EIP1193Provider
}

interface EIP6963ProviderInfo {
	uuid: string
	name: string
	icon: string
	rdns: string
}

export type EIP6963AnnounceProviderEvent = {
	detail: {
		info: EIP6963ProviderInfo
		provider: EIP1193Provider
	}
}

/* EIP-1193 */
export interface RequestArguments {
	readonly method: string
	readonly params?: readonly unknown[] | object
}

export interface EIP1193Provider {
	request: <T>(args: RequestArguments) => Promise<T>
	on: (event: string, listener: (event: any) => void) => void
	removeListener: (event: string, listener: (event: any) => void) => void
}

export interface ProviderRpcError extends Error {
	message: string
	code: number
	data?: unknown
}

/* extended Provider */
export interface Provider extends EIP1193Provider {
	connect?: () => Promise<unknown>
	disconnect?: () => unknown
}

/* W3 */
export type Connector = Injected


/**Queries Store */

export type WriteContractQuery = <
  TAbi extends Abi,
  TFunctionName extends ExtractAbiFunctionNames<TAbi, 'nonpayable' | 'payable'>
>(params: {
  chain?: Chain,
  address: string,
  abi: TAbi,
  functionName: TFunctionName,
  args: AbiParametersToPrimitiveTypes<ExtractAbiFunction<TAbi, TFunctionName>['inputs']>
}) => Promise<void>

export type ReadContractQuery = <
  TAbi extends Abi,
  TFunctionName extends ExtractAbiFunctionNames<TAbi, 'view' | 'pure'>
>(params: {
  chain?: Chain,
  address: string,
  abi: TAbi,
  functionName: TFunctionName,
  args: AbiParametersToPrimitiveTypes<ExtractAbiFunction<TAbi, TFunctionName>['inputs']>
}) => Promise<AbiParametersToPrimitiveTypes<ExtractAbiFunction<TAbi, TFunctionName>['outputs']>[0]>

export type WatchContractEvent = <
  TAbi extends Abi,
  TEventName extends ExtractAbiEventNames<TAbi>
>(
  config: {
    address: string
    abi: TAbi
    eventName: TEventName
    onLogs: (logs: {
      eventName: TEventName
      args: AbiParametersToPrimitiveTypes<ExtractAbiEvent<TAbi, TEventName>['inputs']>
    }[]) => void
  }
) => () => void

export type SendTransaction = (params: {
  account: string
  to: string
  value: bigint
}) => Promise<string> 

export type SignMessage = (params: {
  account: string
  message: string | Uint8Array
}) => Promise<string>

export type WaitForTransactionReceipt = (params: {
  hash: string
}) => Promise<{
  blockHash: string
  blockNumber: bigint
  from: string
  to?: string
  status: 'success' | 'reverted'
  transactionHash: string
  // include any additional fields like above
}>

/** Global */

declare global {
	interface W3vmSigner {}
	interface W3vmClient {}
}