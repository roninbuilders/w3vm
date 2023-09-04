import { useSyncExternalStore } from 'react'
import { subW3, getW3 } from 'w3-evm'

export function getW3Chain () {
  return useSyncExternalStore(subW3.chainId,getW3.chainId,getW3.chainId)
}