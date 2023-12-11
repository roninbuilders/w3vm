import { readable } from 'svelte/store'
import { subW3, getW3, type ProviderRpcError } from '@w3vm/core'

export function getW3Error(){
  return readable<Error | ProviderRpcError | undefined>(getW3.error(),subW3.error)
}