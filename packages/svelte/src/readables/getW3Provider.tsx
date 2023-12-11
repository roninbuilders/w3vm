import { readable } from 'svelte/store'
import { subW3, getW3, type Provider } from '@w3vm/core'

const provider = readable<Provider | undefined>(getW3.walletProvider(), subW3.walletProvider)
export function getW3Provider() {
  return provider
}