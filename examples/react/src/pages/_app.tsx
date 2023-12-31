import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import { W3, initW3, Injected } from '@w3vm/react'
import { WalletConnect } from '@w3vm/walletconnect'
import { Coinbase } from '@w3vm/coinbase'
import { MetaMask } from '@w3vm/metamask'

import walletconnect from 'public/walletconnect.svg'
import coinbase from 'public/coinbase.svg'
import metamask from 'public/metamask.svg'
import wallet from 'public/wallet.png'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string

const w3props = initW3({
  connectors: [
    new Injected({ icon: wallet }), 
    new WalletConnect({ 
      projectId, 
      icon: walletconnect, 
      showQrModal: true, 
      chains:[1] 
    }),
    new Coinbase({ 
      appName:'Test', 
      icon: coinbase, 
      defaultChainId: 1, 
      defaultJsonRpcUrl:'https://mainnet.infura.io/v3/'
    })
  ],
  SSR: true,
})

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <W3 {...w3props} />
    <Component {...pageProps} />
  </>
}
