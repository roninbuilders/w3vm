import type { Abi } from "abitype";
import { Contract } from "ethers";

export type GetContractInstanceOptions = { 
  abi: Abi,
  contractAddress: string,
  chainId: string
}

type EthersContractInstance = InstanceType<typeof Contract>;

declare global {
  interface ContractInstance extends EthersContractInstance {}
}