import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { createWeb3Modal } from '@w3vm/web3modal'

const plugin = {
  fetchEnsName:async ()=>'Glitch.eth',
  fetchEnsAvatar:async ()=>'',
  fetchBalance:async ()=>({ formatted: '123', symbol:'BNB' }),
}

createWeb3Modal({ projectId:'cdbd18f9f96172be74c3e351ce99b908', chains:[1, 137], plugin })
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}