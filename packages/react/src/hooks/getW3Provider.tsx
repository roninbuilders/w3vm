import { useSyncExternalStore } from 'react'
import { subW3, getW3 } from '@w3vm/core'

export function getW3Provider() {
	return useSyncExternalStore(subW3.walletProvider, getW3.walletProvider, getW3.walletProvider)
}
