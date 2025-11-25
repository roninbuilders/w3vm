import { createSignal } from 'solid-js'
import { w3vmStore } from '@w3vm/core'

const [connectors, setConnectors] = createSignal(w3vmStore.get('connectors'))
w3vmStore.subscribe('connectors', setConnectors)

export { connectors }
