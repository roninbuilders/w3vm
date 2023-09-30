import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { openModal } from '@w3vm/web3modal'
import { getW3Chain, getW3Address } from '@w3vm/react'

export default function Home() {
  const address = getW3Address()
  const chainId = getW3Chain()

  return (
    <main className={styles.main}>
      <button onClick={openModal} >Open</button>
      address: {address}
      <br />
      chain id: {chainId}
    </main>
  )
}
