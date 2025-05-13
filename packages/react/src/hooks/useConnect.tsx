import { useSyncExternalStore } from 'react'
import { connectW3, disconnectW3, w3vmStore } from '@w3vm/core'

export function useConnect() {
	const connectors = useSyncExternalStore(
		(callback) => w3vmStore.subscribe('connectors', callback),
		() => w3vmStore.get('connectors'),
		() => w3vmStore.get('connectors'),
	)
	const status = useSyncExternalStore(
		(callback) => w3vmStore.subscribe('status', callback),
		() => w3vmStore.get('status'),
		() => w3vmStore.get('status'),
	)
	return { connectors, connectW3, disconnectW3, status }
}
