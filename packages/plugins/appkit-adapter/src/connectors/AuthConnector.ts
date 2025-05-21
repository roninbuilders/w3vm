import { ConstantsUtil as CommonConstantsUtil, type EmbeddedWalletTimeoutReason } from '@reown/appkit-common'
import { NetworkUtil } from '@reown/appkit-common'
import { AccountController, AlertController } from '@reown/appkit-controllers'
import { ErrorUtil } from '@reown/appkit-utils'
import { W3mFrameProvider } from '@reown/appkit-wallet'
import { W3mFrameProviderSingleton } from '@reown/appkit/auth-provider'
import { _clearW3, _KEY_WALLET, Injected, Provider, w3vmStore } from '@w3vm/core'

type W3mAuthOptions = {
	projectId: string
	enableAuthLogger?: boolean
	icon?: any
}

export class AuthConnector extends Injected {
	readonly id = CommonConstantsUtil.CONNECTOR_ID.AUTH
	readonly name = CommonConstantsUtil.CONNECTOR_NAMES.AUTH
	readonly projectId: string
	readonly icon?: any
	readonly enableAuthLogger: boolean

	private provider?: Provider

	constructor(options: W3mAuthOptions) {
		super()
		this.icon = options.icon
		this.projectId = options.projectId
		this.enableAuthLogger = Boolean(options.enableAuthLogger)

		this.getProvider = () => {
			if (!this.provider) {
				this.provider = W3mFrameProviderSingleton.getInstance({
					projectId: this.projectId,
					enableLogger: this.enableAuthLogger,
					abortController: ErrorUtil.EmbeddedWalletAbortController,
					onTimeout: (reason: EmbeddedWalletTimeoutReason) => {
						if (reason === 'iframe_load_failed') {
							AlertController.open(ErrorUtil.ALERT_ERRORS.IFRAME_LOAD_FAILED, 'error')
						} else if (reason === 'iframe_request_timeout') {
							AlertController.open(ErrorUtil.ALERT_ERRORS.IFRAME_REQUEST_TIMEOUT, 'error')
						} else if (reason === 'unverified_domain') {
							AlertController.open(ErrorUtil.ALERT_ERRORS.UNVERIFIED_DOMAIN, 'error')
						}
					},
				}) as unknown as Provider
			}

			return Promise.resolve(this.provider)
		}
	}

	parseChainId(chainId: string | number) {
		return NetworkUtil.parseEvmChainId(chainId) || 1
	}

	async connect({ chain, socialUri }: { chain?: number; socialUri?: string } = {}) {
		w3vmStore.set('status', 'Connecting')
		const provider = this.getProvider() as unknown as W3mFrameProvider
		let chainId = chain

		const preferredAccountType = AccountController.state.preferredAccountTypes?.eip155

		const { address, chainId: frameChainId } = await provider.connect({
			chainId,
			preferredAccountType,
			//@ts-ignore this is Reown type, why is not supported?
			socialUri: socialUri,
		})

		const parsedChainId = this.parseChainId(frameChainId)
		w3vmStore.set('address', address)
		w3vmStore.set('chainId', parsedChainId)
		w3vmStore.set('connectedWallet', {
			provider: provider as unknown as Provider,
			connectorId: this.id,
		})

		localStorage.setItem(_KEY_WALLET, this.id)
		this.addEvents(provider as unknown as Provider)
		w3vmStore.set('status', undefined)
	}

	async disconnect() {
		const provider = (await this.getProvider()) as Provider
		await provider?.disconnect?.()
		this.removeEvents(provider)
		_clearW3()
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
		if (accounts[0]) {
			w3vmStore.set('address', accounts[0])
		} else {
			_clearW3()
		}
	}

	protected onChainChange = (chainId: string | number) => {
		w3vmStore.set('chainId', Number(chainId))
	}
}
