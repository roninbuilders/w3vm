import { subW3, getW3, type ProviderRpcError, type Provider, Injected } from '@w3vm/core';

type Status = 'Initializing' | 'Connecting' | 'Disconnecting' | 'Loading' | 'GeneratingURI' | undefined;

export let address = $state<string | undefined>(getW3.address());
export let chainId = $state<number | undefined>(getW3.chainId());
export let error = $state<Error | ProviderRpcError | undefined>(getW3.error());
export let provider = $state<Provider | undefined>(getW3.walletProvider());
export let connectors = $state<Injected[]>(getW3.connectors());
export let status = $state<Status>(getW3.status());

subW3.address((newAddress: string | undefined) => {
  address = newAddress;
});

subW3.chainId((newChainId: number | undefined) => {
  chainId = newChainId;
});

subW3.error((newError: Error | ProviderRpcError | undefined) => {
  error = newError;
});

subW3.walletProvider((newProvider: Provider | undefined) => {
  provider = newProvider;
});

subW3.connectors((newConnectors: Injected[]) => {
  connectors = newConnectors;
});

subW3.status((newStatus: Status) => {
  status = newStatus;
});
