import EthereumProvider, {
	type EthereumProviderOptions,
} from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'
import {
	Chain,
	Injected,
	Provider,
	_clearW3 as clearW3,
	setW3,
	_KEY_WALLET as KEY_WALLET,
	_catchError as catchError,
	getW3,
} from '@w3vm/core'
import { setWC } from '../store'

type WalletConnectOptions = {
	showQrModal?: boolean
	qrModalOptions?: EthereumProviderOptions['qrModalOptions']
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
		const { EthereumProvider } = await import('@walletconnect/ethereum-provider')

		const { showQrModal, qrModalOptions, projectId, chains: optionalChains, metadata } = this.options

		//@ts-ignore - strict type on chains vs optionalChains
		const provider = await EthereumProvider.init({
			projectId,
			metadata,
			optionalChains,
			showQrModal: showQrModal ?? false,
			qrModalOptions,
		}).catch(catchError)

		if (!provider) {
			setW3.status(undefined)
			throw new Error('Failed to initialize WalletConnect')
		}

		this.provider = provider as Provider

		provider.on('disconnect', () => {
			clearW3(this.id)
		})

		function onUri(uri: string) {
			if (uri) setW3.status('Connecting')
			setWC.uri(uri)
		}
		provider.on('display_uri', onUri)
		provider.on('session_event', setWC.sessionEvent)
		this.addEvents(provider as Provider)

		if (provider.session) {
			const connected = await this.setAccountAndChainId(provider as Provider)
			if (connected) {
				if (localStorage.getItem(KEY_WALLET) !== this.id) localStorage.setItem(KEY_WALLET, this.id)
				setW3.walletProvider(provider as Provider), setW3.status(undefined)
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

		await (provider as EthereumProvider).connect?.({ optionalChains }).catch(catchError)

		const connected = await this.setAccountAndChainId(this.provider)
		if (connected) {
			setW3.walletProvider(provider as Provider)
			localStorage.setItem(KEY_WALLET, this.id)
			this.addEvents(provider as Provider)
		}

		setW3.status(undefined)
	}

	async disconnect() {
		setW3.status('Disconnecting')
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
			setW3.address(accounts[0])
		} else {
			const walletProvider = getW3.walletProvider()
			if (walletProvider) this.removeEvents(walletProvider)
			clearW3()
		}
	}

	protected onChainChange = (chainId: string | number) => {
		setW3.chainId(Number(chainId))
	}
}
