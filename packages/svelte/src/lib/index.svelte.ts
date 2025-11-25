import { w3vmStore, type ProviderRpcError, type Provider, Injected } from '@w3vm/core'

type Status = 'Initializing' | 'Connecting' | 'Disconnecting' | 'Loading' | 'GeneratingURI' | undefined

type W3vm = {
	connectors: Injected[]
}

type Wallet = {
	address: string | undefined
	provider: Provider | undefined
	error: Error | ProviderRpcError | undefined
	chainId: number | undefined
	status: Status
}

export const w3vm = $state<W3vm>({
	connectors: w3vmStore.get('connectors'),
})

export const wallet = $state<Wallet>({
	address: w3vmStore.get('address'),
	provider: w3vmStore.get('walletProvider'),
	error: w3vmStore.get('error'),
	chainId: w3vmStore.get('chainId'),
	status: w3vmStore.get('status'),
})

w3vmStore.subscribe('address', (newAddress: string | undefined) => {
	wallet.address = newAddress
})

w3vmStore.subscribe('chainId', (newChainId: number | undefined) => {
	wallet.chainId = newChainId
})

w3vmStore.subscribe('error', (newError: Error | ProviderRpcError | undefined) => {
	wallet.error = newError
})

w3vmStore.subscribe('walletProvider', (newProvider: Provider | undefined) => {
	wallet.provider = newProvider
})

w3vmStore.subscribe('status', (newStatus: Status) => {
	wallet.status = newStatus
})

w3vmStore.subscribe('connectors', (newConnectors: Injected[]) => {
	w3vm.connectors = newConnectors
})
