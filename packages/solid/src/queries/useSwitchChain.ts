import { SolidMutationOptions, useMutation } from '@tanstack/solid-query'
import { switchChain } from '@w3vm/core'
import { createEffect, createMemo } from 'solid-js'
import { address } from '../signals/address'

type UseSwitchChainOptions = () => Omit<
        SolidMutationOptions<Awaited<ReturnType<typeof switchChain>>, Error, number, unknown>,
        'mutationFn'
>

export function useSwitchChain(mutationOptions?: UseSwitchChainOptions) {
        const mutation = useMutation(() => ({
                ...(mutationOptions?.() ?? {}),
                mutationFn: (chainId: number) => switchChain({ chain: chainId }),
        }))

        createEffect(() => {
                // Reset mutation when wallet is disconnected.
                if (!address()) {
                        mutation.reset()
                }
        })

        return createMemo(() => ({
                ...mutation,
                switchChain: mutation.mutate,
        }))
}
