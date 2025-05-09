import { subW3, getW3, type ProviderRpcError, type Provider, Injected } from '@w3vm/core';

type Status = 'Initializing' | 'Connecting' | 'Disconnecting' | 'Loading' | 'GeneratingURI' | undefined;

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
  connectors: getW3.connectors()
});

export const wallet = $state<Wallet>({
  address: getW3.address(),
  provider: getW3.walletProvider(),
  error: getW3.error(),
  chainId: getW3.chainId(),
  status: getW3.status(),
});

subW3.address((newAddress: string | undefined) => {
  wallet.address = newAddress;
});

subW3.chainId((newChainId: number | undefined) => {
  wallet.chainId = newChainId;
});

subW3.error((newError: Error | ProviderRpcError | undefined) => {
  wallet.error = newError;
});

subW3.walletProvider((newProvider: Provider | undefined) => {
  wallet.provider = newProvider;
});

subW3.status((newStatus: Status) => {
  wallet.status = newStatus;
});

subW3.connectors((newConnectors: Injected[]) => {
  w3vm.connectors = newConnectors;
});