import { initQueriesStore, w3vmStore } from '@w3vm/core'
import { getBrowserProvider, getContractInstance, getFallbackRpcProvider } from './utils/index.js'
import { formatEther } from 'ethers'
import { AbiParametersToPrimitiveTypes, ExtractAbiEvent } from 'abitype'

initQueriesStore({
  writeContract: async(params)=>{
    const connectedWallet = w3vmStore.get('connectedWallet')
    if (!connectedWallet) {
      throw new Error('Ethers writeContract internal: Provider not found')
    }

    //TODO: Check for correct chainId
    const chainId = params.chain?.chainId || w3vmStore.get('chainId')
    if (!chainId) {
      throw new Error('Ethers readContract internal: ChainId not found')
    }
    const contractInstance = getContractInstance({ abi: params.abi, contractAddress: params.address, chainId: chainId?.toString() as string })

    if(!contractInstance[params.functionName]){
      throw new Error(`Ethers writeContract internal: Function ${params.functionName} not found in contract`)
    }
    const res = await contractInstance[params.functionName]?.(...params.args)
    return res
  },
  readContract: async(params)=>{
    const chainId = params.chain?.chainId
    if (!chainId) {
      throw new Error('Ethers readContract internal: ChainId not found')
    }
    const contractInstance = getContractInstance({ abi: params.abi, contractAddress: params.address, chainId: chainId.toString() })

    if(!contractInstance[params.functionName]){
      throw new Error(`Ethers writeContract internal: Function ${params.functionName} not found in contract`)
    }
    const res = await contractInstance[params.functionName]?.(...params.args)
    return res
  },
  getBalance: async ({ address, chainId }:{ address: string, chainId: string | number }) => {
    const fallbackRpcProvider = getFallbackRpcProvider(chainId)
    const balance = await fallbackRpcProvider.getBalance(address)
    const formatted = formatEther(balance)

    const chains = w3vmStore.get('chains')
    const chain = chains.find((chain) => Number(chain.chainId) === Number(chainId))
    return { formatted, symbol: chain?.nativeCurrency?.symbol || 'ETH', ...chain?.nativeCurrency }
  },
  signMessage: async ({ address, message }) => {
    const provider = getBrowserProvider()
    const signer = await provider.getSigner(address)
    const signature = await signer.signMessage(message)
    return signature
  },
  sendTransaction: async ({ address, to, value }) => {
    const provider = getBrowserProvider()
    const signer = await provider.getSigner(address)
    const tx = await signer.sendTransaction({
      to,
      value
    })
    return tx.hash
  },
  estimateGas: async ({ address, to, value, data }) => {
    const provider = getBrowserProvider()
    const signer = address ? await provider.getSigner(address) : provider
    const gas = await signer.estimateGas({
      to,
      value,
      data
    })
    return gas
  },
  watchContractEvent: ({ address, abi, eventName, onLogs }) => {
    const contract = getContractInstance({ abi, contractAddress: address, chainId: w3vmStore.get('chainId')?.toString() as string })
  
    const listener = (...args: AbiParametersToPrimitiveTypes<ExtractAbiEvent<typeof abi, typeof eventName>["inputs"]>) => {
      onLogs([
        {
          eventName,
          args: args.slice(0, -1) as AbiParametersToPrimitiveTypes<ExtractAbiEvent<typeof abi, typeof eventName>["inputs"]>
        }
      ])
    }
  
    contract.on(eventName, listener)
  
    return () => {
      contract.off(eventName, listener)
    }
  },

  watchPendingTransactions: ({ pollingInterval = 1000, onError, onTransactions }) => {
    const provider = getBrowserProvider()
    let isActive = true
    let seen = new Set<string>()
  
    const interval = setInterval(async () => {
      try {
        const block = await provider.getBlock("pending")
        if (block && block.transactions) {
          const newHashes = block.transactions.filter((hash) => !seen.has(hash))
          newHashes.forEach((h) => seen.add(h))
          if (newHashes.length > 0) {
            onTransactions(newHashes)
          }
        }
      } catch (err) {
        onError?.(err as Error)
      }
    }, pollingInterval)
  
    return () => {
      isActive = false
      clearInterval(interval)
    }
  },
  waitForTransactionReceipt: async ({ hash, timeout }) => {
    const provider = getBrowserProvider()
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
      transactionHash: receipt.hash
    }
  },
  
})