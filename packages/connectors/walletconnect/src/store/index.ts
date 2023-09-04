import { createStore } from 'vanilla-cafe'

interface WalletConnectStore {
  /**
   * WalletConnect URI
   */
  uri: string
}

export const { set: setWC, sub: subWC, get: getWC } = createStore<WalletConnectStore>({
  uri: ''
})