import { useSyncExternalStore } from 'react'
import { subW3, getW3, connectW3, disconnectW3 } from '@w3vm/core'

export function useConnect(){
  const connectors = useSyncExternalStore(subW3.connectors, getW3.connectors, getW3.connectors)
  const status = useSyncExternalStore(subW3.status, getW3.status, getW3.status)
  return { connectors, connectW3, disconnectW3, status }
}