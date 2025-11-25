export { address } from './signals/address'
export { chainId } from './signals/chain'
export { connectors } from './signals/connectors'
export { error } from './signals/error'
export { status } from './signals/status'
export { walletProvider } from './signals/provider'

export { connectW3, disconnectW3, initEIP6963, initW3, Injected, w3vmStore } from '@w3vm/core'
export type { Chain, EIP1193Provider, Provider, ProviderRpcError } from '@w3vm/core'

export {
        useConnect,
        useReadContract,
        useSendTransaction,
        useSignMessage,
        useSwitchChain,
        useWaitForTransactionReceipt,
        useWriteContract,
} from './queries'
