import { EIP6963Connector } from "../connectors/EIP6963"
import { setW3, getW3 } from "../store/w3store"
import { Chain, Connector, EIP6963AnnounceProviderEvent } from "../types"
import { KEY_WALLET } from "../constants"

/* EIP-6963 subscriber */
export function initEIP6963(){
  function onAnnouncement(event: EIP6963AnnounceProviderEvent){
    if(getW3.connectors().find(({ uuid }) => uuid === event.detail.info.uuid)) return
    setW3.connectors(connectors => [ new EIP6963Connector(event.detail), ...connectors ])
  }
  window.addEventListener("eip6963:announceProvider", onAnnouncement);
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  
  return ()=>window.removeEventListener("eip6963:announceProvider", onAnnouncement)
}

/* Init Function */
export function initW3({
  connectors,
  defaultChain,
  SSR
}:{connectors: Connector[], defaultChain?: Chain | number, SSR?: Boolean}){
  setW3.defaultChain(defaultChain), setW3.connectors(connectors)
  
  if(typeof window === 'undefined') return
  if(SSR) return { connectors }
  
  initEIP6963()
  for(let c of connectors) c.init()
  
  if(!localStorage.getItem(KEY_WALLET)){
    setW3.wait(undefined)
  }else{
    setTimeout(_storedWalletExists, 1000)  
  }
}

export const _storedWalletExists = ()=>{
  const selectedWallet = window.localStorage.getItem(KEY_WALLET)
  if(selectedWallet && !getW3.connectors().some(c=>c.id === selectedWallet)){
    window.localStorage.removeItem(KEY_WALLET), setW3.wait(undefined)

    throw Error(`${selectedWallet} session was saved on storage but the wallet was NOT found`)
  }
}