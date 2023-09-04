import EthereumProvider, { QrModalOptions } from "@walletconnect/ethereum-provider/dist/types/EthereumProvider"
import { Chain, Injected, Provider, _clearW3 as clearW3, setW3, _KEY_WALLET as KEY_WALLET, _catchError as catchError } from 'w3-evm'
import { setWC } from "../store"

type WalletConnectOptions = {
  showQrModal?: boolean,
  qrModalOptions?: QrModalOptions,
  icon?: any,
  projectId: string,
  chains?: number[],
  optionalChains?: number[]
}

export class WalletConnect extends Injected {
  readonly id: string
  readonly name: string
  readonly icon?: any
  private provider?: Provider
  private options: WalletConnectOptions
  getProvider:()=>Promise<Provider> | Provider | undefined

  constructor(options: WalletConnectOptions){
    const getProvider = ()=>{
      return this.provider
    }

    super()

    this.id = "walletConnect"
    this.name = 'WalletConnect'
    this.icon = options?.icon
    this.options = options
    this.getProvider = getProvider
  }

  async init(){
    const { EthereumProvider } = await import("@walletconnect/ethereum-provider")

    const { showQrModal, qrModalOptions, projectId, chains, optionalChains } = this.options
    
    //@ts-ignore - strict type on chains vs optionalChains
    const provider = await EthereumProvider.init({
      projectId,
      chains,
      optionalChains,
      showQrModal:showQrModal ?? false,
      qrModalOptions,
    }).catch(catchError)
  
    if(!provider) throw new Error('Failed to initialize WalletConnect - Error not caught')

    this.provider = provider as Provider
    
    provider.on("disconnect", () => { 
      clearW3(this.id)
    });

    provider.on('display_uri', setWC.uri)
  
    if(provider.session){    
      const connected = await this.setAccountAndChainId(provider as Provider)
      if(connected) {
        if(localStorage.getItem(KEY_WALLET) !== this.id) localStorage.setItem(KEY_WALLET, this.id)
        setW3.walletProvider(provider as Provider), setW3.wait(undefined)
      return
      }
    }
    window?.dispatchEvent(new Event('WalletConnect#ready', {bubbles: true}))
  }

  async connect({ chain: _chain }:{chain?: Chain | number} = {}){
    
    const provider = await this.getProvider()

    if(!provider){
      function c(this: InstanceType<typeof WalletConnect>){
        this.connect({chain: _chain})
      }
      window.addEventListener('WalletConnect#ready',c.bind(this) , { once: true })
      return
    }
    
    setW3.wait('Connecting')

    const { chains: _chains, optionalChains: _opChains } = this.options
    let chain: number | undefined;
    let chains = _chains ?? []
    let optionalChains = _opChains ?? []

    if(_chain){
      optionalChains = [ ...chains, ...optionalChains ]
      
      if(typeof _chain === 'number') chain = _chain
      else chain = Number(_chain?.chainId)
    }

    await (provider as EthereumProvider).connect?.({
      chains: chain ? [chain] : _chains,
      optionalChains: chain ? optionalChains : _opChains,
    })
    .catch(catchError)
    
    const connected = await this.setAccountAndChainId(this.provider)
    if(connected) {
      setW3.walletProvider(provider as Provider)
      localStorage.setItem(KEY_WALLET,this.id)
    }

    setW3.wait(undefined)
  }

  async disconnect() {
    setW3.wait('Disconnecting')
    const provider = await this.getProvider()
    console.log(provider)
    await provider?.disconnect?.()
    clearW3()
  }
}