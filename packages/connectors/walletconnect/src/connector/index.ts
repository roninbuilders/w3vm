import {
	Chain,
	Injected,
	Provider,
	_clearW3 as clearW3,
	w3vmStore,
	_KEY_WALLET as KEY_WALLET,
	_catchError as catchError,
} from '@w3vm/core'
import { wcStore } from '../store'
import EthereumProvider, { EthereumProviderOptions } from '../provider'

type WalletConnectOptions = {
	metadata?: EthereumProviderOptions['metadata']
	icon?: any
	projectId: string
	chains?: number[]
}

export class WalletConnect extends Injected {
	readonly id: string
	readonly name: string
	readonly icon?: any
	private provider?: Provider
	private options: WalletConnectOptions
	getProvider: () => Promise<Provider> | Provider | undefined

	constructor(options: WalletConnectOptions) {
		const getProvider = () => {
			return this.provider
		}

		super()

		this.id = 'walletConnect'
		this.name = 'WalletConnect'
		this.icon = options?.icon
		this.options = options
		this.getProvider = getProvider
	}

	async init() {
		const { projectId, chains: optionalChains, metadata } = this.options

		//@ts-ignore - strict type on chains vs optionalChains
		const provider = await EthereumProvider.init({
			projectId,
			metadata,
			optionalChains,
		}).catch(catchError)

		if (!provider) {
			w3vmStore.set('status', undefined)
			throw new Error('Failed to initialize WalletConnect')
		}

		this.provider = provider as Provider

		provider.on('disconnect', () => {
			clearW3(this.id)
		})

		function onUri(uri: string) {
			if (uri) w3vmStore.set('status', 'Connecting')
			wcStore.set('uri', uri)
		}

		function onSessionEvent(event: unknown) {
			wcStore.set('sessionEvent', event)
		}

		/**clean up before subscribing... */
		provider.off('display_uri', onUri)
		provider.off('session_event', onSessionEvent)
		this.removeEvents(provider as Provider)

		provider.on('display_uri', onUri)
		provider.on('session_event', onSessionEvent)
		this.addEvents(provider as Provider)

		if (provider.session) {
			const connected = await this.setAccountAndChainId(provider as Provider)
			if (connected) {
				if (localStorage.getItem(KEY_WALLET) !== this.id) localStorage.setItem(KEY_WALLET, this.id)
				w3vmStore.set('connectedWallet', {
					provider: provider as Provider,
					connectorId: this.id,
				}),
					w3vmStore.set('status', undefined)
				return
			}
		}
		window?.dispatchEvent(new Event('WalletConnect#ready', { bubbles: true }))
	}

	async connect({ chain: _chain }: { chain?: Chain | number } = {}) {
		const provider = await this.getProvider()

		if (!provider) {
			function c(this: InstanceType<typeof WalletConnect>) {
				this.connect({ chain: _chain })
			}
			window.addEventListener('WalletConnect#ready', c.bind(this), { once: true })
			return
		}

		const { chains } = this.options

		let optionalChains = chains ?? []

		if (_chain) {
			if (typeof _chain === 'number') optionalChains = [_chain, ...optionalChains]
			else optionalChains = [Number(_chain?.chainId), ...optionalChains]
		}

		await (provider as Awaited<ReturnType<(typeof EthereumProvider)['init']>>)
			.connect?.({ optionalChains })
			.catch(catchError)

		const connected = await this.setAccountAndChainId(this.provider)
		if (connected) {
			w3vmStore.set('connectedWallet', {
				provider,
				connectorId: this.id,
			})
			localStorage.setItem(KEY_WALLET, this.id)
			this.addEvents(provider as Provider)
		}

		w3vmStore.set('status', undefined)
	}

	async disconnect() {
		w3vmStore.set('status', 'Disconnecting')
		const provider = await this.getProvider()
		await provider?.disconnect?.()
		clearW3()
	}

	protected addEvents(provider: Provider) {
		provider.on('accountsChanged', this.onAccountChange)
		provider.on('chainChanged', this.onChainChange)
	}

	protected removeEvents(provider: Provider) {
		provider.removeListener('accountsChanged', this.onAccountChange)
		provider.removeListener('chainChanged', this.onChainChange)
	}

	protected onAccountChange = (accounts: string[]) => {
		if (typeof accounts[0] !== 'undefined') {
			w3vmStore.set('address', accounts[0])
		} else {
			const walletProvider = w3vmStore.get('connectedWallet')?.provider as Provider
			if (walletProvider) this.removeEvents(walletProvider)
			clearW3()
		}
	}

	protected onChainChange = (chainId: string | number) => {
		w3vmStore.set('chainId', Number(chainId))
	}
}
