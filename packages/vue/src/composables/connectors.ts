import { ref } from 'vue'
import { w3vmStore, type Injected } from '@w3vm/core'

export const connectors = ref<Injected[]>(w3vmStore.get('connectors'))

function onConnectors(_connectors: Injected[]) {
	connectors.value = _connectors
}

w3vmStore.subscribe('connectors', onConnectors)
