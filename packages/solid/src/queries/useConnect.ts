import { SolidMutationOptions, useMutation } from '@tanstack/solid-query'
import { type Connector, connectW3 } from '@w3vm/core'
import { createEffect, createMemo } from 'solid-js'
import { address } from '../signals/address'

type UseConnectOptions = () => Omit<
        SolidMutationOptions<void, Error, Connector, unknown>,
        'mutationFn'
>

export function useConnect(mutationOptions?: UseConnectOptions) {
        const mutation = useMutation(() => ({
                ...(mutationOptions?.() ?? {}),
                mutationFn: (connector: Connector) => connectW3({ connector }),
        }))

        createEffect(() => {
                // Reset mutation when wallet is disconnected.
                if (!address()) {
                        mutation.reset()
                }
        })

        return createMemo(() => ({
                ...mutation,
                connect: mutation.mutate,
        }))
}
