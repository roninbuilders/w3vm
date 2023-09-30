import { subW3 } from '@w3vm/core'
import { ethers } from 'ethers'
import { get, set, sub } from './store'
import { formatEther } from 'ethers/lib/utils'

subW3.walletProvider((walletProvider)=>{
  if(!walletProvider) return
  const provider = new ethers.providers.Web3Provider(walletProvider)
  set.provider(provider)
})

export function createEthers(provider: ethers.providers.Provider){
  return {
    fetchEnsName: async ({ address }: { address: string })=>{
      const _provider = provider ?? get.provider()
      
      const name = await _provider?.lookupAddress(address)
      if(name) set.ENSName(name)
      return name
    },
    fetchEnsAvatar: async ({ name }: { name: string })=>{      
      const _provider = get.provider()

      const avatar = await _provider?.getAvatar(name)
      if(avatar) set.ENSAvatar(avatar)
      return avatar
    },
    fetchBalance:async ({ address, chainId, token }:{ address: string, chainId: number, token?: string })=>{
      const _provider = provider ?? get.provider()
      if(!_provider) return

      if(token){
        const abi = [
          "function balanceOf(address owner) view returns (uint256)",
          "function symbol() view returns (string)"
        ]
        const erc20 = new ethers.Contract(token, abi, _provider)
        const [balance, symbol] = await Promise.all([
          await erc20.balanceOf(address),
          await erc20.symbol()
        ])

        return { formatted: formatEther(balance), symbol: symbol as string }
      }

      return { formatted: formatEther(await _provider.getBalance(address)), symbol: 'ETH' }
    },
  }
}

export { 
  sub as subEthers,
  get as getEthers 
} 