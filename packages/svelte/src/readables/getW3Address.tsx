import { readable } from 'svelte/store'
import { subW3, getW3 } from '@w3vm/core'

const address = readable<string | undefined>(getW3.address(),subW3.address)

export function getW3Address () {
  return address
}