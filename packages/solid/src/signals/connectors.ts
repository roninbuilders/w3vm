import { createSignal } from 'solid-js'
import { subW3, getW3 } from '@w3vm/core'

const [connectors, setConnectors] = createSignal(getW3.connectors())
subW3.connectors(setConnectors)

export { connectors }