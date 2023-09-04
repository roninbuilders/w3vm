import { Chain } from "w3-evm-react";

export const arbitrum: Chain = {
  chainName: 'Arbitrum One',
  chainId:'0xA4B1',
  nativeCurrency:{
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls:['https://arb1.arbitrum.io/rpc'],
  blockExplorerUrls:['https://arbiscan.io'],
  iconUrls:['']
}