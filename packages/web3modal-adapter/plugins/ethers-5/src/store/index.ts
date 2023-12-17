import { providers } from 'ethers'
import { createStore } from 'vanilla-cafe'

type EthersStore = {
	provider?: providers.Web3Provider
	ENSName?: string
	ENSAvatar?: string
}

export const { get, sub, set } = createStore<EthersStore>({
	provider: undefined,
	ENSName: undefined,
	ENSAvatar: undefined,
})
