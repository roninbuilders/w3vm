import { EIP6963Connector } from '../connectors/EIP6963'
import { Chain, Connector, EIP6963AnnounceProviderEvent } from '../types'
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
}: { connectors: Connector[]; defaultChain?: Chain | number; SSR?: Boolean }) {
	w3vmStore.set('defaultChain', defaultChain), w3vmStore.set('connectors', connectors)

	if (typeof window === 'undefined') return
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
