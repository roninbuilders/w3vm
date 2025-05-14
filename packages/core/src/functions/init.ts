import { EIP6963Connector } from '../connectors/EIP6963'
import { EIP6963AnnounceProviderEvent, InitConfig } from '../types'
import { KEY_WALLET } from '../constants'
import { w3vmStore } from '../store/w3store'

/* EIP-6963 subscriber */
export function initEIP6963() {
	function onAnnouncement(event: EIP6963AnnounceProviderEvent) {
		if (w3vmStore.get('connectors').find(({ uuid }) => uuid === event.detail.info.uuid)) return
		w3vmStore.update('connectors', (connectors) => [new EIP6963Connector(event.detail), ...connectors])
	}
	window.addEventListener('eip6963:announceProvider', onAnnouncement)
	window.dispatchEvent(new Event('eip6963:requestProvider'))

	return () => window.removeEventListener('eip6963:announceProvider', onAnnouncement)
}

/* Init Function */
export function initW3({
	connectors,
	defaultChain,
	SSR,
	chains
}: InitConfig) {
	if (typeof window === 'undefined') return
	
	w3vmStore.set('defaultChain', defaultChain)
	w3vmStore.set('connectors', connectors)
	w3vmStore.set('chains', chains)

	if (SSR) return { connectors }

	initEIP6963()
	for (let c of connectors) c.init()

	if (!localStorage.getItem(KEY_WALLET)) {
		w3vmStore.set('status', undefined)
	} else {
		setTimeout(_storedWalletExists, 1000)
	}
}

export const _storedWalletExists = () => {
	const selectedWallet = window.localStorage.getItem(KEY_WALLET)
	if (selectedWallet && !w3vmStore.get('connectors').some((c) => c.id === selectedWallet)) {
		window.localStorage.removeItem(KEY_WALLET), w3vmStore.set('status', undefined)

		throw Error(`${selectedWallet} session was saved on storage but the wallet was NOT found`)
	}
}
