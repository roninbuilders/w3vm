import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { createWeb3Modal } from '@w3vm/web3modal'
import { createEthers } from '@w3vm/web3modal-ethers-5'
import { W3 } from '@w3vm/react'

const projectId = 'cdbd18f9f96172be74c3e351ce99b908'

const w3props = createWeb3Modal({ projectId, chains:[1, 137], plugin: createEthers() })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <W3 {...w3props}/>
      <Component {...pageProps} />
    </>
  )
}