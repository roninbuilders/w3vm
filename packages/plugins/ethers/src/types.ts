import type { Connector } from "@w3vm/core";
import type { Abi } from "abitype";
import { Contract } from "ethers";

export type GetContractInstanceOptions = { 
  abi: Abi,
  connector: Connector, 
  contractAddress: string, 
  withSigner: boolean,
  chainId: string
}

type EthersContractInstance = InstanceType<typeof Contract>;

declare global {
  interface ContractInstance extends EthersContractInstance {}
}