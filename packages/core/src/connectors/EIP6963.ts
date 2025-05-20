import { EIP6963ProviderDetail } from '../types'
import { KEY_WALLET } from '../constants'
import { Injected } from './injected'
import { w3vmStore } from '../store/w3store'

export class EIP6963Connector extends Injected {
	readonly uuid: string
	readonly id: string
	readonly name: string
	icon: any

	constructor({ info, provider }: EIP6963ProviderDetail) {
		super()
		this.uuid = info.uuid
		this.id = info.rdns
		this.name = info.name
		this.icon = info.icon
		this.getProvider = () => provider
		this.init()
	}

	async init() {
		if (window.localStorage.getItem(KEY_WALLET) === this.id) {
			const provider = await this.getProvider()
			if (!provider) throw new Error('EIP-6963 Provider is undefined')

			const connected = await this.setAccountAndChainId(provider)
			if (connected) {
				this.addEvents(provider)
				w3vmStore.set('connectedWallet', {
					provider,
					connectorId: this.id,
				})
			} else {
				window?.localStorage.removeItem(KEY_WALLET)
			}
			w3vmStore.set('status', undefined)
		}
	}
}
