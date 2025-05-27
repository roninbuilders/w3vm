import { createSignal } from 'solid-js'
import { w3vmStore } from '@w3vm/core'

const [walletProvider, setWalletProvider] = createSignal(w3vmStore.get('connectedWallet')?.provider)
w3vmStore.subscribe('connectedWallet', (wallet) => setWalletProvider(wallet?.provider))

export { walletProvider }
