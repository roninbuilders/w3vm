import { w3vmStore } from "@w3vm/core"
import { GetContractInstanceOptions } from "../types.js"
import { BrowserProvider } from "ethers"
import { JsonRpcProvider } from "ethers"
import { Contract } from "ethers"
import { InterfaceAbi } from "ethers"

// Initialize the store for contract instances
const browserProviders = new Map<string, BrowserProvider>()
const jsonRpcProviders = new Map<string, JsonRpcProvider>()

/**
 * Get the contract instance
 * @param options - The options to get the contract instance
 * @returns ContractInstance
 */
export async function getContractInstance({ abi, connector, contractAddress, withSigner, chainId }: GetContractInstanceOptions): Promise<ContractInstance> {
  const contractInstances = w3vmStore.get('contractInstances')

  const contractKey = JSON.stringify({ contractAddress, withSigner, chainId, connectorId: connector.id })
  if(contractInstances.has(contractKey)){
    return contractInstances.get(contractKey) as ContractInstance
  }

  let ethersProvider: BrowserProvider | JsonRpcProvider
  if(withSigner){
    ethersProvider = getBrowserProvider()
  }else {
    ethersProvider = getRpcProvider(chainId)
  }

  const contractInstance = new Contract(contractAddress, abi as InterfaceAbi, ethersProvider)

  contractInstances.set(contractKey, contractInstance)
  return contractInstance
}

/**
 * Get the connected wallet provider
 * @returns BrowserProvider
 */
export function getBrowserProvider(): BrowserProvider {
  const connectedWallet = w3vmStore.get('connectedWallet')
  if (!connectedWallet) {
    throw new Error('Ethers getBrowserProvider internal: Provider not found')
  }
  if(browserProviders.has(connectedWallet.connectorId)){
    return browserProviders.get(connectedWallet.connectorId) as BrowserProvider
  }

  const browserProvider = new BrowserProvider(connectedWallet.provider)
  browserProviders.set(connectedWallet.connectorId, browserProvider)

  return browserProvider
}

/**
 * Get the RPC provider for a given chainId
 * @param chainId - The chain ID to get the provider for
 * @returns JsonRpcProvider
 */
export function getRpcProvider(chainId: number | string): JsonRpcProvider {
  const chains = w3vmStore.get('chains')
  const chain = chains.find((chain) => Number(chain.chainId) === Number(chainId))
  if(!chain) {
    throw new Error('Ethers getContractInstance internal: Chain not found')
  }
  if(jsonRpcProviders.has(chainId.toString())){
    return jsonRpcProviders.get(chainId.toString()) as JsonRpcProvider
  }

  const url = chain.rpcUrls?.[0]
  if (!url) {
    throw new Error('Ethers getContractInstance internal: URL not found')
  }
  const jsonRpcProvider = new JsonRpcProvider(url)
  jsonRpcProviders.set(chainId.toString(), jsonRpcProvider)
  return jsonRpcProvider
}