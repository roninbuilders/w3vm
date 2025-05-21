import { initQueriesStore, w3vmStore } from '@w3vm/core'
import { createEthersHelpers } from './utils/index.js'
import { formatEther } from 'ethers'

export function initEthers() {
	const helpers = createEthersHelpers()

	initQueriesStore({
		writeContract: async (params) => {
			const connectedWallet = w3vmStore.get('connectedWallet')
			if (!connectedWallet) {
				throw new Error('Ethers writeContract internal: Provider not found')
			}

			//TODO: Check for correct chainId
			const chainId = params.chain?.chainId || w3vmStore.get('chainId')
			if (!chainId) {
				throw new Error('Ethers readContract internal: ChainId not found')
			}
			const contractInstance = helpers.getContractInstance({
				abi: params.abi,
				contractAddress: params.address,
				chainId: chainId?.toString() as string,
			})

			if (!contractInstance[params.functionName]) {
				throw new Error(`Ethers writeContract internal: Function ${params.functionName} not found in contract`)
			}
			const res = await contractInstance[params.functionName]?.(...params.args)
			return res
		},
		readContract: async (params) => {
			const chainId = params.chain?.chainId
			if (!chainId) {
				throw new Error('Ethers readContract internal: ChainId not found')
			}
			const contractInstance = helpers.getContractInstance({
				abi: params.abi,
				contractAddress: params.address,
				chainId: chainId.toString(),
			})

			if (!contractInstance[params.functionName]) {
				throw new Error(`Ethers writeContract internal: Function ${params.functionName} not found in contract`)
			}
			const res = await contractInstance[params.functionName]?.(...params.args)
			return res
		},
		getBalance: async ({ address, chainId }: { address: string; chainId: string | number }) => {
			const fallbackRpcProvider = helpers.getFallbackRpcProvider(chainId)
			const balance = await fallbackRpcProvider.getBalance(address)
			const formatted = formatEther(balance)

			const chains = w3vmStore.get('chains')
			const chain = chains.find((chain) => Number(chain.chainId) === Number(chainId))
			return { formatted, symbol: chain?.nativeCurrency?.symbol || 'ETH', ...chain?.nativeCurrency }
		},
		signMessage: async ({ address, message }) => {
			const provider = helpers.getBrowserProvider()
			const signer = await provider.getSigner(address)
			const signature = await signer.signMessage(message)
			return signature
		},
		sendTransaction: async ({ from, to, value }) => {
			const provider = helpers.getBrowserProvider()
			const signer = await provider.getSigner(from)
			const tx = await signer.sendTransaction({
				to,
				value,
			})
			return tx.hash
		},
		estimateGas: async ({ from, to, value, data, chainId }) => {
			const provider = helpers.getFallbackRpcProvider(chainId)
			const gas = await provider.estimateGas({
				from,
				to,
				value,
				data,
			})
			return gas
		},
		waitForTransactionReceipt: async ({ hash, timeout }) => {
			const provider = helpers.getBrowserProvider()
			const receipt = await provider.waitForTransaction(hash, undefined, timeout)
			if (!receipt) {
				throw new Error(`Transaction ${hash} not found`)
			}

			return {
				blockHash: receipt.blockHash,
				blockNumber: BigInt(receipt.blockNumber),
				from: receipt.from,
				to: receipt.to as string,
				status: receipt.status === 1 ? 'success' : 'reverted',
				transactionHash: receipt.hash,
			}
		},
	})
}
