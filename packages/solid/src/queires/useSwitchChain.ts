import { SolidMutationOptions, useMutation } from "@tanstack/solid-query"
import { switchChain } from "@w3vm/core"
import { createEffect, createMemo } from "solid-js"
import { address } from "../signals/address"

export function useSwitchChain(mutationOptions: ()=>Omit<SolidMutationOptions, 'mutationFn'>){
  const mutation = useMutation(()=>({
      ...(mutationOptions ? mutationOptions() : {}),
      mutationFn: (chainId: unknown)=> switchChain({ chain: chainId as number })
    })
  )
  
  createEffect(()=>{
  //Reset mutation when wallet is disconnected.
    if(!address()){
      mutation.reset()
    }
  })

  const switchChainResult = createMemo(() => ({
    ...mutation,
    connect: mutation.mutate
  }))

  return switchChainResult
}