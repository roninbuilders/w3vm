import { initQueriesStore, Queries, w3vmStore } from '@w3vm/core'
import { getBrowserProvider } from './utils/index.js'
import { formatEther } from 'ethers'

initQueriesStore({
  writeContract: async()=>({} as ReturnType<Queries['WriteContractQuery']>),
  readContract: async()=>({} as ReturnType<Queries['ReadContractQuery']>),
  watchContractEvent: ()=>({} as ReturnType<Queries['WatchContractEvent']>),
  watchPendingTransactions: ()=>({} as ReturnType<Queries['WatchPendingTransactions']>),
  signMessage: async()=>({} as ReturnType<Queries['SignMessage']>),
  sendTransaction: async()=>({} as ReturnType<Queries['SendTransaction']>),
  estimateGas: async()=>({} as ReturnType<Queries['EstimateGas']>),
  waitForTransactionReceipt: async()=>({} as ReturnType<Queries['WaitForTransactionReceipt']>),
  getBalance: async ({ address }:{ address: string }) => {
    const browserProvider = getBrowserProvider()
    const balance = await browserProvider.provider.getBalance(address ?? (await browserProvider.getSigner()).address)
    const formatted = formatEther(balance)

    const chains = w3vmStore.get('chains')
    const chainId = w3vmStore.get('chainId')
    const chain = chains.find((chain) => Number(chain.chainId) === Number(chainId))

    return { formatted, symbol: chain?.nativeCurrency?.symbol || 'ETH', ...chain?.nativeCurrency }
  },
})
