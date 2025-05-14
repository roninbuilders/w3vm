import { Store } from "memomap";
import { ReadContractQuery, WatchContractEvent, WriteContractQuery } from "../types";

type W3vmQueriesStore = {
  signerOrClient: W3vmSigner | W3vmClient | undefined
  writeContract: WriteContractQuery
  readContract: ReadContractQuery
  watchContractEvent: WatchContractEvent
}

export const w3vmQueriesStore = new Store<W3vmQueriesStore>({
  signerOrClient: undefined,
  writeContract: async()=>({} as ReturnType<WriteContractQuery>),
  readContract: async()=>({} as ReturnType<ReadContractQuery>),
  watchContractEvent: ()=>({} as ReturnType<WatchContractEvent>),
})