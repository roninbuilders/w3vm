import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import { initW3, Injected } from '@w3vm/core'
import { WalletConnect } from '@w3vm/walletconnect'
import { Web3Modal } from '../lib/web3modal/src/client'
 
/* WalletConnect Project Id */
const projectId = 'cdbd18f9f96172be74c3e351ce99b908'

initW3({
  connectors: [
    new Injected(), 
    new WalletConnect({ 
      projectId,
      showQrModal: false,
      optionalChains:[1, 137],
    })
  ],
  defaultChain: 1, // Optional
})

const modal = new Web3Modal({ plugin:{
  fetchEnsName:async ()=>'Glitch.eth',
  fetchEnsAvatar:async ()=>'',
  fetchBalance:async ()=>({ formatted: '123', symbol:'BNB' }),
}, projectId, _sdkVersion:'html-wagmi-3.0.0-beta.3', chains:[1] })

export function openModal(){
  modal.open()
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}