import {
  Injected, 
  Provider, 
  _clearW3 as clearW3,
  setW3,
  _KEY_WALLET as KEY_WALLET
} from '@w3vm/core'
import type { CommunicationLayerPreference, MetaMaskSDK } from '@metamask/sdk'

type MetaMaskOptions = {
  dappMetadata: {
    name: string,
    url: string
  },
  openDeeplink?: (deeplinkUrl: string)=> void
  communicationLayerPreference?: CommunicationLayerPreference
  transports?: ('websocket' | 'polling')[]
  icon?: any
}

export class MetaMask extends Injected {
  readonly id: string
  readonly name: string
  readonly icon?: any
  private options: MetaMaskOptions
  private MMSDK?: MetaMaskSDK
  getProvider:()=>Promise<Provider | undefined> | Provider | undefined

  constructor(options: MetaMaskOptions){

    const getProvider = ()=>this.MMSDK?.getProvider() as Provider
    
    super()

    this.id = "metamask"
    this.name = 'MetaMask'
    this.icon = options.icon
    this.options = options
    this.getProvider = getProvider
  }

  async init(){
    const {
      dappMetadata,
      openDeeplink,
      communicationLayerPreference,
      transports
    } = this.options
    
    this.MMSDK = new (await import('@metamask/sdk')).MetaMaskSDK({
      dappMetadata,
      injectProvider: false,
      openDeeplink,
      communicationLayerPreference,
      transports,
    })
      
    if(window.localStorage.getItem(KEY_WALLET) === this.id){
      await this.MMSDK.init()
      const connected = await this.setAccountAndChainId(this.MMSDK.getProvider() as Provider)
      if(connected) setW3.walletProvider(this.MMSDK.getProvider() as Provider)
      else window.localStorage.removeItem(KEY_WALLET)
    }
    setW3.status(undefined)
  }

  async disconnect(): Promise<void> {
    setW3.status('Disconnecting')
    const provider = this.MMSDK?.getProvider() as Provider
    if(provider) this.removeEvents(provider)
    this.MMSDK?.disconnect()
    clearW3(this.id)
  }
}