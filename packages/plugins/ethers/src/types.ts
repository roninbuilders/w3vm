import type { Abi } from 'abitype'

export type GetContractInstanceOptions = {
	abi: Abi
	contractAddress: string
	chainId: string
}
