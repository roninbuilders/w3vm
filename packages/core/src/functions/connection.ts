import { KEY_WALLET } from '../constants'
import { w3vmStore } from '../store/w3store'

import { Chain, Connector } from '../types'

/* Connect & Disconnect Functions */
export async function connectW3({ connector, chain }: { connector: Connector; chain?: Chain | number }): Promise<void> {
	if (connector.id === 'walletConnect') w3vmStore.set('status', 'GeneratingURI')
	await connector.connect({ chain })
}

export async function disconnectW3() {
	const connectors = w3vmStore.get('connectors')
	const [connector] = connectors.filter((c) => c.id === window?.localStorage.getItem(KEY_WALLET))

	if (connector) await connector.disconnect()
	else for (let c of connectors) c.disconnect()
}
