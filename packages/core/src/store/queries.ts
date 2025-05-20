import { Store } from "memomap";
import { EstimateGas, GetBalance, ReadContractQuery, SendTransaction, SignMessage, WaitForTransactionReceipt, WatchContractEvent, WatchPendingTransactions, WriteContractQuery } from "../types";

type W3vmQueriesStore = {
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

export const initQueriesStore = (signerOrClient: W3vmQueriesStore) => {
  w3vmQueriesStore.set('writeContract', signerOrClient.writeContract)
  w3vmQueriesStore.set('readContract', signerOrClient.readContract)
  w3vmQueriesStore.set('watchContractEvent', signerOrClient.watchContractEvent)
  w3vmQueriesStore.set('watchPendingTransactions', signerOrClient.watchPendingTransactions)
  w3vmQueriesStore.set('signMessage', signerOrClient.signMessage)
  w3vmQueriesStore.set('sendTransaction', signerOrClient.sendTransaction)
  w3vmQueriesStore.set('estimateGas', signerOrClient.estimateGas)
  w3vmQueriesStore.set('getBalance', signerOrClient.getBalance)
  w3vmQueriesStore.set('waitForTransactionReceipt', signerOrClient.waitForTransactionReceipt)
}