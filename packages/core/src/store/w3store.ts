import { createStore } from 'vanilla-cafe'
import { Chain, Connector, Provider, ProviderRpcError } from '../types'

interface W3Store {
  /**
   * Current connection state. Shows if there's an ongoing process.
   */
  wait?: 'Initializing' | 'Connecting' | 'Disconnecting' | 'Loading'
  /**
   * Connected wallet address, undefined if disconnected.
   */
  address?: string
  /**
   * Connected chain id.
   */
  chainId?: number
  /**
   * Default chain to switch to when connecting.
   */
  defaultChain?: Chain | number
  /**
   * ProviderRpcError: object with an error message and its code.
   */
  error?: ProviderRpcError | Error
  /**
   * Array of connectors instances.
   */
  connectors: Connector[]
  /**
   * extended EIP-1193 provider of the connected wallet.
   */
  walletProvider?: Provider
}

export const { set: setW3, sub: subW3, get: getW3 } = createStore<W3Store>({
  wait:'Initializing',
  address: undefined,
  chainId: undefined,
  defaultChain: undefined,
  error: undefined,
  connectors: [],
  walletProvider: undefined,
})