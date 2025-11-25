import { type SolidQueryOptions, useQuery } from '@tanstack/solid-query'
import { type Queries, w3vmQueriesStore } from '@w3vm/core'

type UseWaitForTransactionReceiptOptions = () => Parameters<Queries['WaitForTransactionReceipt']>[0] &
        Omit<
                SolidQueryOptions<
                        Awaited<ReturnType<Queries['WaitForTransactionReceipt']>>,
                        Error,
                        Awaited<ReturnType<Queries['WaitForTransactionReceipt']>>,
                        (string | number | undefined)[]
                >,
                'queryFn'
        >

export function useWaitForTransactionReceipt(options: UseWaitForTransactionReceiptOptions) {
        const queryFn = async () => {
                const waitForTransactionReceipt = w3vmQueriesStore.get('waitForTransactionReceipt')

                if (!waitForTransactionReceipt) {
                        throw new Error(
                                'useWaitForTransactionReceipt Error: Ethereum Library not initialized!',
                        )
                }

                const { chainId, hash, timeout } = options()

                return waitForTransactionReceipt({ chainId, hash, timeout })
        }

        return useQuery(() => {
                const { chainId, hash, queryKey, timeout, ...rest } = options()

                return {
                        ...rest,
                        queryKey: queryKey ?? ['waitForTransactionReceipt', chainId, hash, timeout],
                        queryFn,
                }
        })
}
