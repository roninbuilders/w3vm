import { useSyncExternalStore } from 'react'
import { subW3, getW3 } from 'w3-evm'

export function getW3Error(){
  return useSyncExternalStore(subW3.error, getW3.error, getW3.error)
}