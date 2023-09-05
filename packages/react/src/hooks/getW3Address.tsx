import { useSyncExternalStore } from 'react'
import { subW3, getW3 } from '@w3vm/core'

export function getW3Address () {
  return useSyncExternalStore(subW3.address,getW3.address,getW3.address)
}