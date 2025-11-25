import { type SolidMutationOptions, useMutation } from '@tanstack/solid-query'
import { type Queries, w3vmQueriesStore } from '@w3vm/core'
import { createMemo } from 'solid-js'

type UseSendTransactionOptions = () => Omit<
        SolidMutationOptions<
                Awaited<ReturnType<Queries['SendTransaction']>>,
                Error,
                Parameters<Queries['SendTransaction']>[0],
                unknown
        >,
        'mutationFn'
>

export function useSendTransaction(mutationOptions?: UseSendTransactionOptions) {
        const mutationFn = async (params: Parameters<Queries['SendTransaction']>[0]) => {
                const sendTransaction = w3vmQueriesStore.get('sendTransaction')

                if (!sendTransaction) {
                        throw new Error('useSendTransaction Error: Ethereum Library not initialized!')
                }

                return sendTransaction(params)
        }

        const mutation = useMutation(() => ({
                ...(mutationOptions?.() ?? {}),
                mutationFn,
        }))

        return createMemo(() => ({
                ...mutation,
                sendTransaction: mutation.mutate,
        }))
}
