export { error } from './composables/error'
export { address } from './composables/address'
export { chainId } from './composables/chain'
export { walletProvider } from './composables/provider'
export { status } from './composables/status'
export { connectors } from './composables/connectors'

export {
	getW3,
	setW3,
	subW3,
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
