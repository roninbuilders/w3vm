import { useSyncExternalStore } from 'react'
import { subW3, getW3 } from 'w3-evm'

export function getW3Address () {
  return useSyncExternalStore(subW3.address,getW3.address,getW3.address)
}