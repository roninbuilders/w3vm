import { createSignal } from 'solid-js'
import { w3vmStore } from '@w3vm/core'

const [chains, setChains] = createSignal(w3vmStore.get('chains'))
w3vmStore.subscribe('chains', setChains)

export { chains }
