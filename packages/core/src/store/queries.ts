import { Store } from "memomap";
import { ReadContractQuery, WatchContractEvent, WriteContractQuery } from "../types";

type W3vmQueriesStore = {
  signerOrClient: W3vmSigner | W3vmClient | undefined
  writeContract: WriteContractQuery | undefined
  readContract: ReadContractQuery | undefined
  watchContractEvent: WatchContractEvent | undefined
}

export const w3vmQueriesStore = new Store<W3vmQueriesStore>({
  signerOrClient: undefined,
  writeContract: undefined,
  readContract: undefined,
  watchContractEvent: undefined,
})