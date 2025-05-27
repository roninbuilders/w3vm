import { MutateOptions, useMutation } from "@tanstack/solid-query"
import { switchChain } from "@w3vm/core"
import { createEffect } from "solid-js"
import { address } from "../signals/address"

export function createConnect(){
  const mutation = useMutation(()=>({
      mutationFn: (chainId: unknown)=> switchChain({ chain: chainId as number })
    })
  )
  
  createEffect(()=>{
  //Reset mutation when wallet is disconnected.
    if(!address()){
      mutation.reset()
    }
  })

  return {
    ...mutation,
    connect: mutation.mutate as (chainId: number, options?: MutateOptions) => Promise<void>
  }
}