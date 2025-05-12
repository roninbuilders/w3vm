import { ref } from 'vue'
import { w3vmStore } from '@w3vm/core'

export const chainId = ref<number | undefined>(w3vmStore.get('chainId'))

function onChainId(_chainId: number | undefined) {
	chainId.value = _chainId
}

w3vmStore.subscribe('chainId', onChainId)
