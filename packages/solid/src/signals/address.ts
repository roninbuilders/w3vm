import { createSignal } from 'solid-js'
import { w3vmStore } from '@w3vm/core'

const [address, setAddress] = createSignal(w3vmStore.get('address'))
w3vmStore.subscribe('address', setAddress)

export { address }
