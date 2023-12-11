import { readable } from 'svelte/store'
import { subW3, getW3 } from '@w3vm/core'

export function getW3Chain () {
  return readable<number | undefined>(getW3.chainId(),subW3.chainId)
}