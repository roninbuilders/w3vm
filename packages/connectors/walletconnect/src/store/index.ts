import { Store } from 'memomap'

interface WalletConnectStore {
	/**
	 * WalletConnect URI
	 */
	uri: string
	/**
	 * Last session update state
	 */
	sessionEvent: unknown
}

export const wcStore = new Store<WalletConnectStore>({
	uri: '',
	sessionEvent: undefined,
})
