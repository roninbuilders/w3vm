import { setW3 } from "../store/w3store";
import { EIP6963ProviderDetail } from "../types";
import { KEY_WALLET } from "../constants";
import { Injected } from "./injected";

export class EIP6963Connector extends Injected {
  readonly uuid: string
  readonly id: string
  readonly name: string
  icon: any

  constructor({ info, provider }: EIP6963ProviderDetail){

    super()
    this.uuid = info.uuid
    this.id = info.rdns
    this.name = info.name
    this.icon = info.icon
    this.getProvider = ()=>provider
    this.init()
  }

  async init(){
    if(window.localStorage.getItem(KEY_WALLET) === this.id){
      const provider = await this.getProvider()
      if(!provider) throw new Error('EIP-6963 Provider is undefined')

      const connected = await this.setAccountAndChainId(provider)
      if(connected){
        this.addEvents(provider)
        setW3.walletProvider(provider)
      }else{
        window?.localStorage.removeItem(KEY_WALLET)
      }
      setW3.wait(undefined)
    }
  }
}