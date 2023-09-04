import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { W3, initW3, Injected } from 'w3-evm-react'
import walletconnect from 'public/walletconnect.svg'
import wallet from 'public/wallet.png'
import { WalletConnect } from 'w3-evm-walletconnect'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string

const w3props = initW3({
  connectors: [
    new Injected({ icon: wallet }), 
    new WalletConnect({ projectId, icon: walletconnect, showQrModal: true, chains:[1] })
  ],
  SSR: true,
})

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <W3 {...w3props} />
    <Component {...pageProps} />
  </>
}
