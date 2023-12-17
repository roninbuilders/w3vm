import { ref } from 'vue'
import { subW3, getW3 } from '@w3vm/core'

type Status = 'Initializing' | 'Connecting' | 'Disconnecting' | 'Loading' | 'GeneratingURI' | undefined

export const status = ref<Status>(getW3.status())

function onStatus(_provider: Status) {
	status.value = _provider
}

subW3.status(onStatus)
