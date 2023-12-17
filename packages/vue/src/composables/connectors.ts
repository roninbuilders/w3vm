import { ref } from 'vue'
import { subW3, getW3, type Injected } from '@w3vm/core'

export const connectors = ref<Injected[]>(getW3.connectors())

function onConnectors(_connectors: Injected[]){
  connectors.value = _connectors
}

subW3.connectors(onConnectors)