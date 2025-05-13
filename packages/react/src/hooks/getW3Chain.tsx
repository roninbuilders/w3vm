import { useSyncExternalStore } from 'react'
import { w3vmStore } from '@w3vm/core'

export function getW3Chain() {
	return useSyncExternalStore(
		(callback) => w3vmStore.subscribe('chainId', callback),
		() => w3vmStore.get('chainId'),
		() => w3vmStore.get('chainId'),
	)
}
