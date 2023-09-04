import { Chain } from "w3-evm-react";

export const bsc: Chain = {
  chainId:'0x38',
  chainName: 'Smart Chain',
  nativeCurrency:{
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls:['https://bsc-dataseed1.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com'],
  iconUrls: ['']
}