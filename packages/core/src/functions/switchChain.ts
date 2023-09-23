import { getW3 } from "../store/w3store";
import { Chain } from "../types";
import { catchError } from "../utils";

export async function switchChain({chain}:{chain: number | Chain}){
  const provider = getW3.walletProvider()
  if(!provider){
    catchError(new Error('While calling switchChain Provider was undefined'))
    return
  }
  const chainId = typeof chain === 'number' ? chain : (chain as Chain)?.chainId
  await provider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: "0x" + chainId.toString(16) }],
  }).catch(async (er: any)=>{
    if(typeof chain !== 'number' && (er.code === 4902 || er?.data?.originalError?.code == 4902)){
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [chain],
        })
        .catch(catchError)
    }
  })
}