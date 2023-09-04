export { getW3, setW3, subW3 } from './store/w3store'

export {
  Injected,
  EIP6963Connector
} from './connectors'

export {
  connectW3,
  disconnectW3,
  initEIP6963,
  initW3,
  switchChain,
  _storedWalletExists
} from './functions'

export {
  Chain,
  Provider,
  EIP1193Provider,
  ProviderRpcError,
  Connector
} from './types'

export {
  catchError as _catchError,
  clearW3 as _clearW3
} from './utils'

export {
  KEY_WALLET as _KEY_WALLET
} from './constants'