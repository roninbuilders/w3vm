export { w3vmStore } from './store/w3store'
export { w3vmQueriesStore } from './store/queries'

export {
	Injected,
	EIP6963Connector,
} from './connectors'

export {
	connectW3,
	disconnectW3,
	initEIP6963,
	initW3,
	switchChain,
	_storedWalletExists,
} from './functions'

export type {
	Chain,
	Provider,
	EIP1193Provider,
	ProviderRpcError,
	Connector,
	RequestArguments,
	InitConfig
} from './types'

export {
	catchError as _catchError,
	clearW3 as _clearW3,
} from './utils'

export { KEY_WALLET as _KEY_WALLET } from './constants'
