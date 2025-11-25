import { Abi, BlockTag, erc20Abi, formatUnits, SignableMessage } from 'viem'
import { initQueriesStore, w3vmStore } from '@w3vm/core'
import { createViemHelpers } from './helpers/index.js'
import { Transports } from './types.js'

export function initViem({ transports }: { transports: Transports }) {
	const helpers = createViemHelpers({ transports })

	initQueriesStore({
		writeContract: async (params): Promise<`0x${string}`> => {
			const connectedWallet = w3vmStore.get('connectedWallet')
			if (!connectedWallet) throw new Error('Viem writeContract: Wallet not connected')

			const chainId = params.chainId || w3vmStore.get('chainId')
			if (!chainId) throw new Error('Viem writeContract: ChainId not found')
			const chain = helpers.getChainOrThrow(chainId)

			const walletClient = helpers.getWalletClient(chainId)

			const hash = await walletClient.writeContract({
				account: w3vmStore.get('address') as `0x${string}`,
				address: params.address as `0x${string}`,
				abi: params.abi as Abi,
				functionName: params.functionName,
				args: params.args,
				chain,
			})

			return hash
		},
		readContract: async (params) => {
			const chainId = params.chainId || w3vmStore.get('chainId')
			if (!chainId) throw new Error('Viem readContract: ChainId not found')

			const publicClient = helpers.getPublicClient(chainId)
			const result = await publicClient.readContract({
				address: params.address as `0x${string}`,
				abi: params.abi as Abi,
				functionName: params.functionName,
				args: params.args,
			})
			return result
		},

		getBalance: async ({ address, chainId, token, blockTag }) => {
			const publicClient = helpers.getPublicClient(chainId)

			const value =
				token === 'native'
					? await publicClient.getBalance({ address: address as `0x${string}`, blockTag: blockTag as BlockTag })
					: await publicClient.readContract({
							address: token as `0x${string}`,
							abi: erc20Abi,
							functionName: 'balanceOf',
							args: [address as `0x${string}`],
						})

			const chains = w3vmStore.get('chains')
			const chain = chains.find((chain) => Number(chain.chainId) === Number(chainId))
			const decimals = token === 'native' ? 18 : 18
			const formatted = formatUnits(value, decimals)

			return {
				formatted,
				symbol: chain?.nativeCurrency?.symbol || 'ETH',
			}
		},

		signMessage: async ({ address, message }) => {
			const walletClient = helpers.getWalletClient()
			return walletClient.signMessage({
				account: address as `0x${string}`,
				message: message as SignableMessage,
			})
		},

		sendTransaction: async ({ from, to, value, chainId: _chainId }) => {
			const walletClient = helpers.getWalletClient()
			const chainId = _chainId || w3vmStore.get('chainId')
			if (!chainId) throw new Error('Viem writeContract: ChainId not found')
			const chain = helpers.getChainOrThrow(chainId)

			const hash = await walletClient.sendTransaction({
				account: from as `0x${string}`,
				to: to as `0x${string}`,
				value,
				chain,
			})
			return hash
		},

		estimateGas: async ({ from, to, value, data, chainId: _chainId }) => {
			const chainId = _chainId || w3vmStore.get('chainId')
			if (!chainId) throw new Error('Viem writeContract: ChainId not found')

			const publicClient = helpers.getPublicClient(chainId)
			const gas = await publicClient.estimateGas({
				account: from as `0x${string}`,
				to: to as `0x${string}`,
				value,
				data: data as `0x${string}`,
			})
			return gas
		},

		waitForTransactionReceipt: async ({ hash, chainId: _chainId }) => {
			const chainId = _chainId || w3vmStore.get('chainId')
			if (!chainId) throw new Error('Viem writeContract: ChainId not found')

			const publicClient = helpers.getPublicClient(chainId)

			const receipt = await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` })
			return {
				blockHash: receipt.blockHash,
				blockNumber: receipt.blockNumber,
				from: receipt.from,
				to: receipt.to as string | undefined,
				status: receipt.status === 'success' ? 'success' : 'reverted',
				transactionHash: receipt.transactionHash,
			}
		},
	})
}
