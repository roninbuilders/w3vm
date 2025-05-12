import { useSyncExternalStore } from 'react'
import { w3vmStore } from '@w3vm/core'

export function getW3Error() {
	return useSyncExternalStore((callback)=> w3vmStore.subscribe('error', callback), ()=> w3vmStore.get('error'), ()=> w3vmStore.get('error'))
}
