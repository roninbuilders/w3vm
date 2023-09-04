import {
  Injected, 
  Provider, 
  _clearW3 as clearW3, 
  setW3, 
  _KEY_WALLET as KEY_WALLET
} from '@w3vm/core'

type CoinbaseOptions = {
  appName: string,
  appLogoUrl?: string,
  darkMode?: boolean,
  defaultChainId?: number,
  defaultJsonRpcUrl?: string,
  icon?: any
}

export class Coinbase extends Injected {
  readonly id: string
  readonly name: string
  readonly icon?: any
  private provider?: Provider
  getProvider:()=>Promise<Provider> | Provider | undefined

  constructor({options}:{options: CoinbaseOptions}){

    const {
      appName,
      appLogoUrl,
      darkMode,
      defaultChainId,
      defaultJsonRpcUrl,
      icon
    } = options

    const getProvider = async()=>{
      if (typeof window === 'undefined') return
      if(this.provider) return this.provider

      let CoinbaseWalletSDK = (await import('@coinbase/wallet-sdk')).default
      if (
        typeof CoinbaseWalletSDK !== 'function' &&
        // @ts-expect-error This import error is not visible to TypeScript
        typeof CoinbaseWalletSDK.default === 'function'
      )
      CoinbaseWalletSDK = (
        CoinbaseWalletSDK as unknown as { default: typeof CoinbaseWalletSDK }
      ).default

      const coinbaseWallet = new CoinbaseWalletSDK({
        appName,
        appLogoUrl,
        darkMode
      })
 
      this.provider = coinbaseWallet.makeWeb3Provider(defaultJsonRpcUrl, defaultChainId) 
      return this.provider
    }
    
    super()

    this.id = "coinbase"
    this.name = 'Coinbase'
    this.icon = icon
    // @ts-ignore Coinbase Provider follows EIP1193
    this.getProvider = getProvider
  }

  async disconnect(): Promise<void> {
    setW3.wait('Disconnecting')
    const provider = await this.getProvider()
    //@ts-ignore coinbase provider adds disconnect function
    await provider?.disconnect()
    window?.localStorage.removeItem(KEY_WALLET)
    clearW3()
  }
}