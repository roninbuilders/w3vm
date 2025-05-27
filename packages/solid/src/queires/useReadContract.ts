import { SolidQueryOptions, useQuery } from "@tanstack/solid-query";
import { Queries, w3vmQueriesStore } from "@w3vm/core";

type UseReadContractOptions = ()=> (Parameters<Queries['ReadContractQuery']>[0] & Omit<SolidQueryOptions, 'queryFn'>)

export function useReadContract(options: UseReadContractOptions){
  function queryFn(){
    const readContract = w3vmQueriesStore.get('readContract')
    if(!readContract){
      throw new Error('useReadContract Error: Ethereum Library not initlialized!')
    }
    const { chainId, abi, address, args, functionName } = options()
    
    return readContract({ chainId, abi: abi, address, args, functionName })
  }
  
  return useQuery(()=>{
    const { chainId, abi, queryKey, address, args, functionName, initialData, ...rest } = options()

    return {
      ...rest,
      initialData,
      queryKey: queryKey ?? ['readContract', chainId, address, functionName, JSON.stringify(args)],
      queryFn
    }
  })
}