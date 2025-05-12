import { w3vmStore } from '../store/w3store'
import { ProviderRpcError } from '../types'

export function catchError(e: Error | ProviderRpcError) {
	w3vmStore.set('error', e)
	w3vmStore.set('status', undefined)
	throw e
}
