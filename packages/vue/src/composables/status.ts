import { ref } from 'vue'
import { w3vmStore } from '@w3vm/core'

type Status = 'Initializing' | 'Connecting' | 'Disconnecting' | 'Loading' | 'GeneratingURI' | undefined

export const status = ref<Status>(w3vmStore.get('status'))

function onStatus(_provider: Status) {
	status.value = _provider
}

w3vmStore.subscribe('status', onStatus)
