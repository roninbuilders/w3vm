import type { Abi } from 'abitype'
import { Transport, Chain } from 'viem'

export type GetContractInstanceOptions = {
	abi: Abi
	contractAddress: string
	chainId: string
}

export type Transports = Record<Chain['id'], Transport>