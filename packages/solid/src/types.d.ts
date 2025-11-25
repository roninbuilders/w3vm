declare module 'solid-js' {
        export function createSignal<T>(value?: T): [() => T | undefined, (value: T | ((prev: T | undefined) => T | undefined)) => void]
        export function createEffect(fn: () => void): void
        export function createMemo<T>(fn: () => T): () => T
}

declare module '@tanstack/solid-query' {
        export type SolidMutationOptions<
                TData = unknown,
                TError = unknown,
                TVariables = void,
                TContext = unknown,
        > = {
                mutationFn?: (variables: TVariables) => Promise<TData> | TData
                mutationKey?: unknown
                onSuccess?: (data: TData, variables: TVariables, context?: TContext) => void | Promise<void>
                onError?: (error: TError, variables: TVariables, context?: TContext) => void | Promise<void>
                onSettled?: (
                        data: TData | undefined,
                        error: TError | null,
                        variables: TVariables,
                        context?: TContext,
                ) => void | Promise<void>
        }

        export type SolidQueryOptions<
                TQueryFnData = unknown,
                TError = unknown,
                TData = TQueryFnData,
                TQueryKey = unknown,
        > = {
                queryKey?: TQueryKey
                queryFn?: () => Promise<TQueryFnData> | TQueryFnData
                initialData?: TData
                enabled?: boolean
                staleTime?: number
                refetchInterval?: number | false
        }

        export type SolidQueryObserverResult<TData = unknown, TError = unknown> = {
                data: TData | undefined
                error: TError | null
                isError: boolean
                isSuccess: boolean
                isPending: boolean
                refetch: () => void
        }

        export type SolidMutationObserverResult<TData = unknown, TError = unknown, TVariables = void, TContext = unknown> = {
                mutate: (variables: TVariables) => void
                reset: () => void
                data: TData | undefined
                error: TError | null
                isError: boolean
                isSuccess: boolean
                isPending: boolean
                context?: TContext
        }

        export function useMutation<
                TData = unknown,
                TError = unknown,
                TVariables = void,
                TContext = unknown,
        >(
                options: () => SolidMutationOptions<TData, TError, TVariables, TContext>,
        ): SolidMutationObserverResult<TData, TError, TVariables, TContext>

        export function useQuery<
                TQueryFnData = unknown,
                TError = unknown,
                TData = TQueryFnData,
                TQueryKey = unknown,
        >(
                options: () => SolidQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
        ): SolidQueryObserverResult<TData, TError>
}
