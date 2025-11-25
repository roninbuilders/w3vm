import { createSignal } from 'solid-js'
import { type Provider, w3vmStore } from '@w3vm/core'

const [walletProvider, setWalletProvider] = createSignal(w3vmStore.get('connectedWallet')?.provider)
w3vmStore.subscribe('connectedWallet', (wallet: { provider: Provider } | undefined) =>
        setWalletProvider(wallet?.provider),
)

export { walletProvider }
