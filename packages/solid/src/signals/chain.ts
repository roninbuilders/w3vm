import { createSignal } from 'solid-js'
import { w3vmStore } from '@w3vm/core'

const [chainId, setChainId] = createSignal(w3vmStore.get('chainId'))
w3vmStore.subscribe('chainId', setChainId)

export { chainId }
