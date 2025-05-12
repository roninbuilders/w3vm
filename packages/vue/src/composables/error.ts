import { ref } from 'vue'
import { w3vmStore, type ProviderRpcError } from '@w3vm/core'

export const error = ref<Error | ProviderRpcError | undefined>(w3vmStore.get('error'))

function onError(_error: Error | ProviderRpcError | undefined) {
	error.value = _error
}

w3vmStore.subscribe('error', onError)
