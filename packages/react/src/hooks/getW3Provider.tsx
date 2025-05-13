import { useSyncExternalStore } from 'react'
import { w3vmStore } from '@w3vm/core'

export function getW3Provider() {
	return useSyncExternalStore(
		(callback) => w3vmStore.subscribe('walletProvider', callback),
		() => w3vmStore.get('walletProvider'),
		() => w3vmStore.get('walletProvider'),
	)
}
