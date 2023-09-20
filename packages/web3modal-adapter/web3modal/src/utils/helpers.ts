import type { CaipNetwork, CaipNetworkId, Tokens } from '@web3modal/scaffold'
import type { Web3ModalClientOptions } from '../client.js'
import { NAMESPACE } from './constants.js'
import { NetworkImageIds } from './presets.js'

export function getCaipDefaultChain(chain?: Web3ModalClientOptions['defaultChain']) {
  if (!chain) {
    return undefined
  }

  const chainId = typeof chain === 'number' ? chain : Number(chain.chainId)
  const name = typeof chain === 'number' ? "" : chain.chainName
  return {
    id: `${NAMESPACE}:${chainId}`,
    name: name,
    imageId: NetworkImageIds[chainId]
  } as CaipNetwork
}

export function getCaipTokens(tokens?: Web3ModalClientOptions['tokens']) {
  if (!tokens) {
    return undefined
  }

  const caipTokens: Tokens = {}
  Object.entries(tokens).forEach(([id, token]) => {
    caipTokens[`${NAMESPACE}:${id}`] = token
  })

  return caipTokens
}

export function caipNetworkIdToNumber(caipnetworkId?: CaipNetworkId) {
  return caipnetworkId ? Number(caipnetworkId.split(':')[1]) : undefined
}
