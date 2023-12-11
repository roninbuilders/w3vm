import { readable } from 'svelte/store'
import { subW3, getW3 } from '@w3vm/core'

export function getW3Address () {
  return readable<string | undefined>(getW3.address(),subW3.address)
}