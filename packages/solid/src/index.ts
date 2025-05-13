export { error } from './signals/error'
export { address } from './signals/address'
export { chainId } from './signals/chain'
export { walletProvider } from './signals/provider'
export { status } from './signals/status'
export { connectors } from './signals/connectors'

export {
	w3vmStore,
	Injected,
	initEIP6963,
	initW3,
	connectW3,
	disconnectW3,
} from '@w3vm/core'

export type {
	Chain,
	Provider,
	EIP1193Provider,
	ProviderRpcError,
} from '@w3vm/core'
