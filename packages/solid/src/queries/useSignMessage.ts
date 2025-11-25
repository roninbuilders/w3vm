import { type SolidMutationOptions, useMutation } from '@tanstack/solid-query'
import { type Queries, w3vmQueriesStore } from '@w3vm/core'
import { createMemo } from 'solid-js'

type UseSignMessageOptions = () => Omit<
        SolidMutationOptions<
                Awaited<ReturnType<Queries['SignMessage']>>,
                Error,
                Parameters<Queries['SignMessage']>[0],
                unknown
        >,
        'mutationFn'
>

export function useSignMessage(mutationOptions?: UseSignMessageOptions) {
        const mutationFn = async (params: Parameters<Queries['SignMessage']>[0]) => {
                const signMessage = w3vmQueriesStore.get('signMessage')

                if (!signMessage) {
                        throw new Error('useSignMessage Error: Ethereum Library not initialized!')
                }

                return signMessage(params)
        }

        const mutation = useMutation(() => ({
                ...(mutationOptions?.() ?? {}),
                mutationFn,
        }))

        return createMemo(() => ({
                ...mutation,
                signMessage: mutation.mutate,
        }))
}
