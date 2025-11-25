import { type SolidQueryOptions, useQuery } from '@tanstack/solid-query'
import { type Queries, w3vmQueriesStore } from '@w3vm/core'

type UseReadContractOptions = () => Parameters<Queries['ReadContractQuery']>[0] &
        Omit<
                SolidQueryOptions<unknown, Error, unknown, (string | number | undefined)[]>,
                'queryFn'
        >

export function useReadContract(options: UseReadContractOptions) {
        const queryFn = async () => {
                const readContract = w3vmQueriesStore.get('readContract')

                if (!readContract) {
                        throw new Error('useReadContract Error: Ethereum Library not initialized!')
                }

                const { chainId, abi, address, args, functionName } = options()

                return readContract({ chainId, abi, address, args, functionName })
        }

        return useQuery(() => {
                const { chainId, abi, queryKey, address, args, functionName, ...rest } = options()

                return {
                        ...rest,
                        queryKey: queryKey ?? [
                                'readContract',
                                chainId,
                                address,
                                functionName,
                                JSON.stringify(args),
                        ],
                        queryFn,
                }
        })
}
