import { Store } from "memomap";
import { EstimateGas, GetBalance, ReadContractQuery, SendTransaction, SignMessage, WaitForTransactionReceipt, WatchContractEvent, WatchPendingTransactions, WriteContractQuery } from "../types";

type W3vmQueriesStore = {
  signerOrClient: W3vmSigner | W3vmClient | undefined
  writeContract: WriteContractQuery
  readContract: ReadContractQuery
  watchContractEvent: WatchContractEvent
  watchPendingTransactions: WatchPendingTransactions
  signMessage: SignMessage
  sendTransaction: SendTransaction
  estimateGas: EstimateGas
  getBalance: GetBalance
  waitForTransactionReceipt: WaitForTransactionReceipt
}

export const w3vmQueriesStore = new Store<W3vmQueriesStore>({
  signerOrClient: undefined,
  writeContract: async()=>({} as ReturnType<WriteContractQuery>),
  readContract: async()=>({} as ReturnType<ReadContractQuery>),
  watchContractEvent: ()=>({} as ReturnType<WatchContractEvent>),
  watchPendingTransactions: ()=>({} as ReturnType<WatchPendingTransactions>),
  signMessage: async()=>({} as ReturnType<SignMessage>),
  sendTransaction: async()=>({} as ReturnType<SendTransaction>),
  estimateGas: async()=>({} as ReturnType<EstimateGas>),
  getBalance: async()=>({} as ReturnType<GetBalance>),
  waitForTransactionReceipt: async()=>({} as ReturnType<WaitForTransactionReceipt>),
})