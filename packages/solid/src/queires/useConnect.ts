import { SolidMutationOptions, useMutation } from "@tanstack/solid-query"
import { type Connector, connectW3 } from "@w3vm/core"
import { createEffect, createMemo } from "solid-js"
import { address } from "../signals/address"

export function useConnect(mutationOptions?: ()=> Omit<SolidMutationOptions, 'mutationFn'>){
  const mutation = useMutation(()=>({
      ...(mutationOptions?.() || {}),
      mutationFn: (connector: unknown)=> connectW3({ connector: connector as unknown as Connector })
    })
  )

  createEffect(()=>{
    //Reset mutation when wallet is disconnected.
    if(!address()){
      mutation.reset()
    }
  })
    
  const connectResult = createMemo(() => ({
    ...mutation,
    connect: mutation.mutate
  }))
  
  return connectResult
}