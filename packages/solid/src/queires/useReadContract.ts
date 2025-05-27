import { SolidQueryOptions, useQuery } from "@tanstack/solid-query";
import { Queries, w3vmQueriesStore } from "@w3vm/core";

type UseReadContractOptions = Parameters<Queries['ReadContractQuery']>[0] & Omit<SolidQueryOptions, 'queryFn'>

export function useReadContract({ chainId, abi, address, args, functionName, queryKey, ...rest }: UseReadContractOptions){
  function queryFn(){
    const readContract = w3vmQueriesStore.get('readContract')
    if(!readContract) throw new Error('useReadContract Error: Ethereum Library not initlialized!')

      return readContract({ chainId, abi, address, args, functionName })
  }
  
  const query = useQuery(()=>{
    return {
      rest,
      queryKey: queryKey ?? ['readContract', chainId, address, functionName, JSON.stringify(args)],
      queryFn
    }
  })
}