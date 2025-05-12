import { KEY_WALLET } from '../constants'
import { w3vmStore } from '../store/w3store'

export function clearW3(id?: string) {
	if (typeof id === 'undefined' || localStorage.getItem(KEY_WALLET) === id) {
		localStorage.removeItem(KEY_WALLET)
		w3vmStore.set('address', undefined), w3vmStore.set('chainId', undefined)
		w3vmStore.set('walletProvider', undefined), w3vmStore.set('status', undefined)
	}
}
