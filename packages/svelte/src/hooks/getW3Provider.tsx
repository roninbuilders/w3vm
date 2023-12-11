import { readable } from 'svelte/store'
import { subW3, getW3, type Provider } from '@w3vm/core'

export function getW3Provider() {
  return readable<Provider | undefined>(getW3.walletProvider(), subW3.walletProvider)
}