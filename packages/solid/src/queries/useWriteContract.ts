import { type SolidMutationOptions, useMutation } from '@tanstack/solid-query'
import { type Queries, w3vmQueriesStore } from '@w3vm/core'
import { createMemo } from 'solid-js'

type UseWriteContractOptions = () => Omit<
        SolidMutationOptions<
                Awaited<ReturnType<Queries['WriteContractQuery']>>,
                Error,
                Parameters<Queries['WriteContractQuery']>[0],
                unknown
        >,
        'mutationFn'
>

export function useWriteContract(mutationOptions?: UseWriteContractOptions) {
        const mutationFn = async (params: Parameters<Queries['WriteContractQuery']>[0]) => {
                const writeContract = w3vmQueriesStore.get('writeContract')

                if (!writeContract) {
                        throw new Error('useWriteContract Error: Ethereum Library not initialized!')
                }

                return writeContract(params)
        }

        const mutation = useMutation(() => ({
                ...(mutationOptions?.() ?? {}),
                mutationFn,
        }))

        return createMemo(() => ({
                ...mutation,
                writeContract: mutation.mutate,
        }))
}
