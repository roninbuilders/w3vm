import { w3vmStore } from '@w3vm/core'
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { Chain, PublicClient, WalletClient } from 'viem'

export function createViemHelpers() {
	const publicClients = new Map<string, PublicClient>()
	const walletClients = new Map<string, WalletClient>()

	/**
	 * Get the viem Public Client (read-only)
	 */
	function getPublicClient(chainId: string | number): PublicClient {
		const id = chainId.toString()
		if (publicClients.has(id)) {
			return publicClients.get(id)!
		}

		const chain = getChainOrThrow(chainId)
		const transport = http(chain.rpcUrls.default.http[0])
		const publicClient = createPublicClient({ chain, transport })

		publicClients.set(id, publicClient)
		return publicClient
	}

	/**
	 * Get the viem Wallet Client (for sending txs or signing)
	 */
	function getWalletClient(chainId?: string | number): WalletClient {
		const connectedWallet = w3vmStore.get('connectedWallet')
		if (!connectedWallet) {
			throw new Error('Viem getWalletClient internal: Wallet not connected')
		}
		const _chainId = chainId ?? (w3vmStore.get('chainId') as unknown as string)

		const userAddress = w3vmStore.get('address')
		const key = JSON.stringify({
			chainId: _chainId,
			connectorId: connectedWallet.connectorId,
			address: userAddress,
		})

		if (walletClients.has(key)) {
			return walletClients.get(key)!
		}

		const chain = getChainOrThrow(_chainId)
		const walletClient = createWalletClient({
			account: userAddress as `0x${string}`,
			chain,
			transport: custom(connectedWallet.provider),
		})

		walletClients.set(key, walletClient)
		return walletClient
	}

	/**
	 * Get the chain object from w3vmStore
	 */
	function getChainOrThrow(chainId: string | number): Chain {
		const chains = w3vmStore.get('chains')
		const chain = chains.find((c) => Number(c.chainId) === Number(chainId))
		if (!chain) {
			throw new Error(`Viem getChain: Chain ${chainId} not found in w3vmStore`)
		}
		return {
			name: chain.chainName as string,
			id: Number(chain.chainId),
			rpcUrls: {
				default: { http: chain.rpcUrls as readonly string[] },
				public: { http: chain.rpcUrls as readonly string[] },
			},
			nativeCurrency: {
				name: chain.nativeCurrency?.name ?? 'ETH',
				decimals: Number(chain.nativeCurrency?.decimals),
				symbol: chain.nativeCurrency?.symbol ?? 'ETH',
			},
		} as Chain
	}

	return {
		getPublicClient,
		getWalletClient,
		getChainOrThrow,
	}
}
