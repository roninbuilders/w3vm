import { createSignal } from 'solid-js'
import { w3vmStore } from '@w3vm/core'

const [walletProvider, setWalletProvider] = createSignal(w3vmStore.get('walletProvider'))
w3vmStore.subscribe('walletProvider', setWalletProvider)

export { walletProvider }
