import { ref } from 'vue'
import { subW3, getW3, type ProviderRpcError } from '@w3vm/core'

export const error = ref<Error | ProviderRpcError | undefined>(getW3.error())

function onError(_error: Error | ProviderRpcError | undefined) {
	error.value = _error
}

subW3.error(onError)
