import { readable } from 'svelte/store'
import { subW3, getW3, type ProviderRpcError, Provider, Injected } from '@w3vm/core'

type Status = "Initializing" | "Connecting" | "Disconnecting" | "Loading" | "GeneratingURI" | undefined

export const address = readable<string | undefined>(getW3.address(),subW3.address)
export const chainId = readable<number | undefined>(getW3.chainId(),subW3.chainId)
export const error = readable<Error | ProviderRpcError | undefined>(getW3.error(),subW3.error)
export const provider = readable<Provider | undefined>(getW3.walletProvider(), subW3.walletProvider)
export const connectors = readable<Injected[]>(getW3.connectors(),subW3.connectors)
export const status = readable<Status>(getW3.status(),subW3.status)