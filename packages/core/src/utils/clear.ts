import { KEY_WALLET } from "../constants"
import { setW3 } from "../store/w3store"

export function clearW3(id?: string){
  if(typeof id === 'undefined' || localStorage.getItem(KEY_WALLET) === id){
    localStorage.removeItem(KEY_WALLET)
    setW3.address(undefined), setW3.chainId(undefined)
    setW3.walletProvider(undefined), setW3.wait(undefined)
  }
}