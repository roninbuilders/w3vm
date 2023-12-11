import { readable } from 'svelte/store'
import { subW3, getW3, connectW3, disconnectW3, Injected } from '@w3vm/core'

type Status = "Initializing" | "Connecting" | "Disconnecting" | "Loading" | "GeneratingURI" | undefined

export function useConnect(){
  const connectors = readable<Injected[]>(getW3.connectors(),subW3.connectors)
  const status = readable<Status>(getW3.status(),subW3.status)
  return { connectors, connectW3, disconnectW3, status }
}