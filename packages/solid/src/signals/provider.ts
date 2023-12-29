import { createSignal } from 'solid-js'
import { subW3, getW3 } from '@w3vm/core'

const [walletProvider, setWalletProvider] = createSignal(getW3.walletProvider())
subW3.walletProvider(setWalletProvider)

export { walletProvider }
