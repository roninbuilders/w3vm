import { createStore } from 'vanilla-cafe'

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

export const {
	set: setWC,
	sub: subWC,
	get: getWC,
} = createStore<WalletConnectStore>({
	uri: '',
	sessionEvent: undefined,
})
