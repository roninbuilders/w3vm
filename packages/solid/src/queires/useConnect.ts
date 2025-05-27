import { MutateOptions, useMutation } from "@tanstack/solid-query"
import { Connector, connectW3 } from "@w3vm/core"
import { createEffect } from "solid-js"
import { address } from "../signals/address"

export function createConnect(){
  const mutation = useMutation(()=>({
      mutationFn: (connector: unknown)=> connectW3({ connector: connector as unknown as Connector })
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
    connect: mutation.mutate as (connector: Connector, options?: MutateOptions) => Promise<void>
  }
}