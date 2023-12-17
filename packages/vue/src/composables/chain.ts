import { ref } from 'vue'
import { subW3, getW3 } from '@w3vm/core'

export const chainId = ref<number | undefined>(getW3.chainId())

function onChainId(_chainId: number | undefined) {
	chainId.value = _chainId
}

subW3.chainId(onChainId)
