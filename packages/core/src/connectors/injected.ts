import { Chain, Provider } from '../types'
import { KEY_WALLET } from '../constants'
import { catchError, clearW3 } from '../utils'
import { switchChain } from '../functions'
import { w3vmStore } from '../store/w3store'

type InjectedOpts = {
	uuid?: string
	id?: string
	name?: string
	icon?: any
	getProvider?: () => Promise<Provider> | Provider | undefined
}

export class Injected {
	readonly uuid: string = ''
	readonly id: string
	readonly name: string
	readonly icon?: any

	getProvider: () => Promise<Provider | undefined> | Provider | undefined

	constructor({ icon, name, id, uuid, getProvider }: InjectedOpts = {}) {
		this.uuid = uuid ?? ''
		this.id = id ?? 'injected'
		this.name = name ?? 'Browser Wallet'
		this.icon = icon
		this.getProvider =
			getProvider ??
			(() => {
				if (typeof window === 'undefined') return
				return window.ethereum
			})
	}

	async init() {
		if (window.localStorage.getItem(KEY_WALLET) === this.id) {
			// injection delay - https://groups.google.com/a/chromium.org/g/chromium-extensions/c/ib-hi7hPdW8/m/34mFf8rrGQAJ?pli=1
			await new Promise((r) => setTimeout(r, 100))
			const provider = await this.getProvider()
			if (!provider) {
				window.localStorage.removeItem(KEY_WALLET)
				w3vmStore.set('status', undefined)
				return
			}
			const connected = await this.setAccountAndChainId(provider)
			if (connected) {
				this.addEvents(provider)
				w3vmStore.set('walletProvider', provider)
			} else {
				window?.localStorage.removeItem(KEY_WALLET)
			}
			w3vmStore.set('status', undefined)
		}
	}

	async connect({ chain: _chain }: { chain?: Chain | number } = {}) {
		w3vmStore.set('status', 'Connecting')
		const provider = await this.getProvider()

		if (!provider) {
			w3vmStore.set('status', undefined), catchError(new Error('Provider not found'))
			return
		}
		await provider
			.request<string[]>({ method: 'eth_requestAccounts' })
			.then(async (accounts: string[]) => {
				/* Once connected */

				/* Save to localStorage */
				window?.localStorage.setItem(KEY_WALLET, this.id)

				/* Save address, chain and provider - initialize event listeners */
				w3vmStore.set('address', accounts[0]), w3vmStore.set('walletProvider', provider)
				await this.setChainId(provider), this.addEvents(provider)

				const defaultChain = w3vmStore.get('defaultChain')
				let chain = _chain ?? defaultChain

				/* Request to switch to a default chain */
				if (chain) switchChain({ chain })
			})
			.catch(catchError)

		w3vmStore.set('status', undefined)
	}

	async disconnect() {
		const walletProvider = w3vmStore.get('walletProvider')
		if (walletProvider) this.removeEvents(walletProvider)
		if (walletProvider?.disconnect) walletProvider.disconnect()
		clearW3()
	}

	protected async setAccountAndChainId(provider: Provider | undefined) {
		if (!provider) return
		let connected: boolean = false

		await provider
			.request<string[]>({ method: 'eth_accounts' })
			.then(async (accounts) => {
				if (accounts?.length) {
					w3vmStore.set('address', accounts[0])

					await provider
						.request<string | number>({ method: 'eth_chainId' })
						.then((chainId) => {
							w3vmStore.set('chainId', Number(chainId))
						})
						.catch(catchError)

					connected = true
				} else {
					w3vmStore.set('address', undefined)
				}
			})
			.catch(catchError)

		return connected
	}

	protected async setChainId(provider: Provider) {
		await provider
			.request<string | number>({ method: 'eth_chainId' })
			.then((chainId) => {
				w3vmStore.set('chainId', Number(chainId))
			})
			.catch(console.error)
	}

	protected addEvents(provider: Provider) {
		provider.on('accountsChanged', this.onAccountChange)
		provider.on('chainChanged', this.onChainChange)
		provider.on('connect', this.onConnect)
		provider.on('disconnect', this.onDisconnect)
	}

	protected removeEvents(provider: Provider) {
		provider.removeListener('accountsChanged', this.onAccountChange)
		provider.removeListener('chainChanged', this.onChainChange)
		provider.removeListener('connect', this.onConnect)
		provider.removeListener('disconnect', this.onDisconnect)
	}

	protected onAccountChange = (accounts: string[]) => {
		if (typeof accounts[0] !== 'undefined') {
			w3vmStore.set('address', accounts[0])
		} else {
			const walletProvider = w3vmStore.get('walletProvider') as Provider // TODO
			if (walletProvider) this.removeEvents(walletProvider)
			clearW3()
		}
	}

	protected onChainChange = (chainId: string | number) => {
		w3vmStore.set('chainId', Number(chainId))
	}

	protected onDisconnect = (error: Error) => {
		catchError(error)
	}

	protected onConnect = async () => {
		const provider = await this.getProvider()
		await this.setAccountAndChainId(provider)
	}
}
