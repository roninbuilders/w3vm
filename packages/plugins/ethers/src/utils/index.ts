import { w3vmStore } from "@w3vm/core"
import { GetContractInstanceOptions } from "../types.js"
import { BrowserProvider } from "ethers"
import { JsonRpcProvider } from "ethers"
import { Contract } from "ethers"
import { InterfaceAbi } from "ethers"
import { FallbackProvider } from "ethers"

export function createEthersHelpers(){
  // Initialize the store for contract instances
const browserProviders = new Map<string, BrowserProvider>()
const fallbackRpcProviders = new Map<string, FallbackProvider | JsonRpcProvider>()

/**
 * Get the contract instance
 * @param options - The options to get the contract instance
 * @returns ContractInstance
 */
function getContractInstance({ abi, contractAddress, chainId }: GetContractInstanceOptions): ContractInstance {
  const contractInstances = w3vmStore.get('contractInstances')

  const contractKey = JSON.stringify({ contractAddress, chainId })
  if(contractInstances.has(contractKey)){
    return contractInstances.get(contractKey) as ContractInstance
  }

  const ethersProvider = getFallbackRpcProvider(chainId)
  const contractInstance = new Contract(contractAddress, abi as InterfaceAbi, ethersProvider)

  contractInstances.set(contractKey, contractInstance)
  return contractInstance
}

/**
 * Get the contract instance with Signer
 * @param options - The options to get the contract instance
 * @returns ContractInstance
 */
function getContractInstanceWithSigner({ abi, contractAddress, chainId }: GetContractInstanceOptions): ContractInstance {
  const contractInstances = w3vmStore.get('contractInstances')
  const connectedWallet = w3vmStore.get('connectedWallet')
  const userAddress = w3vmStore.get('address')
  if (!connectedWallet) {
    throw new Error('Ethers getContractInstanceWithSigner internal: Provider not found')
  }

  const contractKey = JSON.stringify({ contractAddress, chainId, connectorId: connectedWallet.connectorId, address: userAddress })
  if(contractInstances.has(contractKey)){
    return contractInstances.get(contractKey) as ContractInstance
  }

  const ethersProvider = getBrowserProvider()
  const contractInstance = new Contract(contractAddress, abi as InterfaceAbi, ethersProvider)

  contractInstances.set(contractKey, contractInstance)
  return contractInstance
}

/**
 * Get the connected wallet provider
 * @returns BrowserProvider
 */
function getBrowserProvider(): BrowserProvider {
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
function getFallbackRpcProvider(chainId: number | string): FallbackProvider | JsonRpcProvider {
  const chains = w3vmStore.get('chains')
  const chain = chains.find((chain) => Number(chain.chainId) === Number(chainId))
  if(!chain) {
    throw new Error('Ethers getContractInstance internal: Chain not found')
  }
  if(!chain.rpcUrls || chain.rpcUrls.length === 0){
    throw new Error('Ethers getContractInstance internal: No RPC URL found')
  }

  if(fallbackRpcProviders.has(chainId.toString())){
    return fallbackRpcProviders.get(chainId.toString()) as FallbackProvider
  }

  let jsonRpcProviders: JsonRpcProvider[] = []
  
  if(chain.rpcUrls.length === 1){
    const jsonRpcProvider = new JsonRpcProvider(chain.rpcUrls[0])
    fallbackRpcProviders.set(chainId.toString(), jsonRpcProvider)
    return new JsonRpcProvider(chain.rpcUrls[0])
  }

  chain.rpcUrls.forEach((url) => {
    jsonRpcProviders.push(new JsonRpcProvider(url))
  })

  const fallbackRpcProvider = new FallbackProvider(jsonRpcProviders)
  fallbackRpcProviders.set(chainId.toString(), fallbackRpcProvider)
  return fallbackRpcProvider
}

return {
  getContractInstance,
  getContractInstanceWithSigner,
  getBrowserProvider,
  getFallbackRpcProvider
  }
}