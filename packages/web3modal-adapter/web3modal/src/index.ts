import { initW3, Connector, Chain } from '@w3vm/core'
import { Plugin, Web3Modal, Web3ModalOptions } from './client'
import { WalletConnect } from '@w3vm/walletconnect';

let modal: Web3Modal;

export function createWeb3Modal({
  connectors = [],
  defaultChain,
  SSR,
  plugin,
  projectId,
  chains,
  ...w3mOptions
}:{connectors?: Connector[], defaultChain?: Chain | number, SSR?: Boolean, plugin: Plugin, projectId: string, chains: number[]} & Web3ModalOptions){
  initW3({
    connectors:[...connectors, new WalletConnect({ 
      projectId,
      showQrModal: false,
      chains
    })],
    defaultChain,
    SSR
  })
  
  modal = new Web3Modal({ plugin, projectId, ...w3mOptions })
}

export function openModal(){
  modal.open()
}