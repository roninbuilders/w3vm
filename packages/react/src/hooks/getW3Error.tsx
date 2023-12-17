import { useSyncExternalStore } from 'react'
import { subW3, getW3 } from '@w3vm/core'

export function getW3Error() {
	return useSyncExternalStore(subW3.error, getW3.error, getW3.error)
}
