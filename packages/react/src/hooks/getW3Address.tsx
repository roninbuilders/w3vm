import { useSyncExternalStore } from 'react'
import { w3vmStore } from '@w3vm/core'

export function getW3Address() {
	return useSyncExternalStore((callback)=> w3vmStore.subscribe('address', callback), ()=> w3vmStore.get('address'), ()=> w3vmStore.get('address'))
}
