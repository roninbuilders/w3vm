import { useSyncExternalStore } from 'react'
import { subW3, getW3, connectW3, disconnectW3 } from 'w3-evm'

export function useConnect(){
  const connectors = useSyncExternalStore(subW3.connectors, getW3.connectors, getW3.connectors)
  const wait = useSyncExternalStore(subW3.wait, getW3.wait, getW3.wait)
  return { connectors, connectW3, disconnectW3, wait }
}