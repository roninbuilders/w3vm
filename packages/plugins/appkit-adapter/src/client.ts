import { type Chain, Connector, connectW3, disconnectW3, type InitConfig, initW3, switchChain, w3vmQueriesStore, w3vmStore } from '@w3vm/core'
import type UniversalProvider from '@walletconnect/universal-provider'

import type {
  AppKitNetwork,
  CaipNetwork,
  CustomRpcUrlMap
} from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil, NetworkUtil } from '@reown/appkit-common'
import { CoreHelperUtil, SocialProvider, StorageUtil } from '@reown/appkit-controllers'
import {
  type ConnectorType,
  ConstantsUtil as CoreConstantsUtil,
  type Provider
} from '@reown/appkit-controllers'
import { CaipNetworksUtil, PresetsUtil } from '@reown/appkit-utils'
import { AdapterBlueprint } from '@reown/appkit/adapters'

import { LimitterUtil } from './utils/LimitterUtil.js'
import { parseWalletCapabilities } from './utils/helpers.js'
import { formatUnits, parseUnits } from 'viem'
import { WalletConnectConnector } from '@reown/appkit/connectors'
import { AuthConnector } from './connectors/AuthConnector.js'

interface PendingTransactionsFilter {
  enable: boolean
  pollingInterval?: number
}

// --- Constants ---------------------------------------------------- //
const DEFAULT_PENDING_TRANSACTIONS_FILTER = {
  enable: false,
  pollingInterval: 30_000
}

export class W3vmAdapter extends AdapterBlueprint {
  public w3vmChains: Chain[] | undefined
  public w3vmConfig: ReturnType<typeof initW3> | undefined
  public w3vmConnectors: Connector[]

  private pendingTransactionsFilter: PendingTransactionsFilter
  private unwatchPendingTransactions: (() => void) | undefined
  private balancePromises: Record<string, Promise<AdapterBlueprint.GetBalanceResult>> = {}

  constructor(
    configParams: Omit<InitConfig, 'chains'> & {
      networks: AppKitNetwork[]
      pendingTransactionsFilter?: PendingTransactionsFilter
      projectId: string
      customRpcUrls?: CustomRpcUrlMap
      isEmail?: boolean
      socials?: SocialProvider[]
    }
  ) {
    const networks = CaipNetworksUtil.extendCaipNetworks(configParams.networks, {
      projectId: configParams.projectId,
      customNetworkImageUrls: {},
      customRpcUrls: configParams.customRpcUrls
    }) as [CaipNetwork, ...CaipNetwork[]]

    super()
    this.w3vmConnectors = configParams.connectors
    this.namespace = CommonConstantsUtil.CHAIN.EVM
    this.adapterType = "w3vm"
    this.projectId = configParams.projectId

    this.pendingTransactionsFilter = {
      ...DEFAULT_PENDING_TRANSACTIONS_FILTER,
      ...(configParams.pendingTransactionsFilter ?? {})
    }

    this.createConfig({ ...configParams, networks })
  }

  override construct(_options: AdapterBlueprint.Params) {
    this.setupWatchers()
  }

  override async getAccounts(): Promise<AdapterBlueprint.GetAccountsResult> {
    const address = w3vmStore.get('address')

    return {
      accounts: [CoreHelperUtil.createAccount('eip155', address || '', 'eoa')]
    }
  }

  private getW3vmConnector(id: string) {
    return w3vmStore.get('connectors').find(c => c.id === id)
  }

  private createConfig(
    configParams: Partial<InitConfig> & {
      networks: CaipNetwork[]
      projectId: string
      customRpcUrls?: CustomRpcUrlMap
      isEmail?: boolean
      socials?: SocialProvider[]
      enableAuthLogger?: boolean
    }
  ) {
    this.w3vmChains = configParams.networks.filter(cn => cn.chainNamespace === CommonConstantsUtil.CHAIN.EVM).map(
      (caipNetwork) => {
        const customRpcs = caipNetwork.rpcUrls[caipNetwork.caipNetworkId]?.http
        const rpcUrls = customRpcs?.length ? [...caipNetwork.rpcUrls.default.http, ...customRpcs] : [...caipNetwork.rpcUrls.default.http]

        return {            
          chainId: caipNetwork.id.toString(),
          blockExplorerUrls: caipNetwork.blockExplorers?.default.url ? [caipNetwork.blockExplorers?.default.url] : undefined,
          chainName: caipNetwork.name,
          iconUrls: [],
          nativeCurrency: {
            ...caipNetwork.nativeCurrency
          },
          rpcUrls,
        } satisfies Chain
      }
    ) as unknown as Chain[]


    const connectors: Connector[] = [...(configParams.connectors ?? [])]

    const socials = configParams.socials
      ? configParams.socials?.length > 0
      : (configParams.socials ?? CoreConstantsUtil.DEFAULT_FEATURES.socials)

    if (configParams.isEmail || socials) {
      connectors.push(
        new AuthConnector({
          projectId: configParams.projectId, 
          enableAuthLogger: configParams.enableAuthLogger
        })
      )
    }

    this.w3vmConfig = initW3({
      chains: this.w3vmChains,
      connectors
    })
  }

  private setupWatchers() {
    w3vmStore.subscribe('address', (address)=>{
      if(address){
        this.setupWatchPendingTransactions()
        this.emit('accountChanged', {
          address: address,
          chainId: w3vmStore.get('chainId')
        })
      }else{
        this.emit('disconnect')
      }
    })

    w3vmStore.subscribe('chainId', (chainId)=>{
      if(chainId){
        this.emit('switchNetwork', {
          address: w3vmStore.get('address'),
          chainId
        })
      }
    })

    w3vmStore.subscribe('connectors', async (connectors)=>{
      for (const connector of connectors){
        const key = connector.id === 'coinbase' ? 'coinbaseWalletSDK' : connector.id
        const provider = await connector.getProvider()
        if (this.namespace) {
          this.addConnector({
            id: key,
            explorerId: PresetsUtil.ConnectorExplorerIds[key],
            imageUrl: connector.icon,
            name: PresetsUtil.ConnectorNamesMap[key] || 'Unknown',
            imageId: PresetsUtil.ConnectorImageIds[key],
            type: PresetsUtil.ConnectorTypesMap[key] ?? 'ANNOUNCED',
            info: connector.uuid ? undefined : { rdns: connector.id },
            chain: this.namespace,
            chains: [],
            provider
          })
        }
      }
    })
  }

  override async syncConnectors(): Promise<void>{
    const connectors = w3vmStore.get('connectors') 
    for (const connector of connectors){
      const key = connector.id === 'coinbase' ? 'coinbaseWalletSDK' : connector.id
      const provider = await connector.getProvider()
      if (this.namespace) {
        this.addConnector({
          id: key,
          explorerId: PresetsUtil.ConnectorExplorerIds[key],
          imageUrl: connector.icon,
          name: PresetsUtil.ConnectorNamesMap[key] || 'Unknown',
          imageId: PresetsUtil.ConnectorImageIds[key],
          type: PresetsUtil.ConnectorTypesMap[key] ?? 'ANNOUNCED',
          info: connector.uuid ? undefined : { rdns: connector.id },
          chain: this.namespace,
          chains: [],
          provider
        })
      }
    }
  }
  
  async syncConnection(params: any): Promise<any>{
    const address = w3vmStore.get('address')
    const chainId = w3vmStore.get('chainId')
    const provider = w3vmStore.get('walletProvider')
    const connector = this.w3vmConnectors.find(c => c.id === params.id)
    return {
      address,
      chainId,
      provider,
      type: connector?.id,
      id: connector?.id
    }
  }

  private setupWatchPendingTransactions() {
    if (!this.pendingTransactionsFilter.enable || this.unwatchPendingTransactions) {
      return
    }
    const watchPendingTransactions = w3vmQueriesStore.get('watchPendingTransactions')
    this.unwatchPendingTransactions = watchPendingTransactions({
      pollingInterval: this.pendingTransactionsFilter.pollingInterval,
      /* Magic RPC does not support the pending transactions. We handle transaction for the AuthConnector cases in AppKit client to handle all clients at once. Adding the onError handler to avoid the error to throw. */
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onError: () => {},
      onTransactions: () => {
        this.emit('pendingTransactions')
        LimitterUtil.increase('pendingTransactions')
      }
    })

    const unsubscribe = LimitterUtil.subscribeKey('pendingTransactions', val => {
      if (val >= CommonConstantsUtil.LIMITS.PENDING_TRANSACTIONS) {
        this.unwatchPendingTransactions?.()
        unsubscribe()
      }
    })
  }

  public async signMessage(
    params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult> {
    try {
      const signMessage = w3vmQueriesStore.get('signMessage')
      const signature = await signMessage({
        message: params.message,
        account: params.address
      })

      return { signature }
    } catch (error) {
      throw new Error('WagmiAdapter:signMessage - Sign message failed')
    }
  }

  public async sendTransaction(
    params: AdapterBlueprint.SendTransactionParams
  ): Promise<AdapterBlueprint.SendTransactionResult> {
    const address = w3vmStore.get('address')
    const chainId = w3vmStore.get('chainId')
    const sendTransaction = w3vmQueriesStore.get('sendTransaction')
    const waitForTransactionReceipt = w3vmQueriesStore.get('waitForTransactionReceipt')
    const txParams = {
      account: address as string,
      to: params.to,
      value: Number.isNaN(Number(params.value)) ? BigInt(0) : BigInt(params.value),
      gas: params.gas ? BigInt(params.gas) : undefined,
      gasPrice: params.gasPrice ? BigInt(params.gasPrice) : undefined,
      data: params.data,
      chainId,
      type: 'legacy' as const,
      parameters: ['nonce'] as const
    }

    const tx = await sendTransaction(txParams)
    await waitForTransactionReceipt({ hash: tx, timeout: 25000 })

    return { hash: tx }
  }

  public async writeContract(
    params: AdapterBlueprint.WriteContractParams
  ): Promise<AdapterBlueprint.WriteContractResult> {
    const { caipNetwork, ...data } = params
    const chainId = Number(NetworkUtil.caipNetworkIdToNumber(caipNetwork.caipNetworkId))
    const writeContract = w3vmQueriesStore.get('writeContract')
    const tx = await writeContract({
      chain: this.w3vmChains?.[chainId],
      address: data.tokenAddress,
      abi: data.abi,
      functionName: data.method,
      args: data.args,
    })

    return { hash: tx }
  }

  public async estimateGas(
    params: AdapterBlueprint.EstimateGasTransactionArgs
  ): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    try {
      const estimateGas = w3vmQueriesStore.get('estimateGas')
      const result = await estimateGas({
        account: params.address as string,
        to: params.to as string,
        data: params.data as string,
      })

      return { gas: result }
    } catch (error) {
      throw new Error('WagmiAdapter:estimateGas - error estimating gas')
    }
  }

  public parseUnits(params: AdapterBlueprint.ParseUnitsParams): AdapterBlueprint.ParseUnitsResult {
    return parseUnits(params.value, params.decimals)
  }

  public formatUnits(
    params: AdapterBlueprint.FormatUnitsParams
  ): AdapterBlueprint.FormatUnitsResult {
    return formatUnits(params.value, params.decimals)
  }

  public override async connectWalletConnect(chainId?: number | string) {
    // Attempt one click auth first, if authenticated, still connect with wagmi to store the session
    const walletConnectConnector = this.getWalletConnectConnector()
    await walletConnectConnector.authenticate()

    const w3vmConnector = this.w3vmConnectors.find(c =>c.id === 'walletConnect')
    if (!w3vmConnector) {
      throw new Error('UniversalAdapter:connectWalletConnect - connector not found')
    }

    await connectW3({ connector: w3vmConnector })

    if (w3vmStore.get('chainId') !== Number(chainId)) {
      await switchChain({ chain: Number(chainId) })
    }

    return { clientId: await walletConnectConnector.provider.client.core.crypto.getClientId() }
  }

  public async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const { id, provider, type, chainId } = params
    const connector = this.getW3vmConnector(id)

    if (!connector) {
      throw new Error('connectionControllerClient:connectExternal - connector is undefined')
    }

    const address = w3vmStore.get('address')
    if (address) {
      const chainId = w3vmStore.get('chainId') as number
      return {
        address,
        chainId,
        provider,
        type: type as ConnectorType,
        id
      }
    }

    await connectW3({ connector, chain: Number(chainId) })

    return {
      address: w3vmStore.get('address') as string,
      chainId: Number(w3vmStore.get('chainId')),
      provider: provider as Provider,
      type: type as ConnectorType,
      id
    }
  }

  public async reconnect(params: AdapterBlueprint.ReconnectParams): Promise<void> {
    await this.connect(params)
  }

  public async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    const address = params.address
    const caipNetwork = this.getCaipNetworks().find(network => network.id === params.chainId)

    if (!address) {
      return Promise.resolve({ balance: '0.00', symbol: 'ETH' })
    }

    if (caipNetwork) {
      const caipAddress = `${caipNetwork.caipNetworkId}:${params.address}`
      const cachedPromise = this.balancePromises[caipAddress]
      if (cachedPromise) {
        return cachedPromise
      }

      const cachedBalance = StorageUtil.getNativeBalanceCacheForCaipAddress(caipAddress)
      if (cachedBalance) {
        return { balance: cachedBalance.balance, symbol: cachedBalance.symbol }
      }

      const getBalance = w3vmQueriesStore.get('getBalance')

      this.balancePromises[caipAddress] = new Promise<AdapterBlueprint.GetBalanceResult>(
        async resolve => {
          try {
            const chainId = params.chainId?.toString()
            const balance = await getBalance({
              address: params.address as string,
              chainId: chainId as string,
              token: params.tokens?.[caipNetwork.caipNetworkId]?.address as string
            })

            StorageUtil.updateNativeBalanceCache({
              caipAddress,
              balance: balance.formatted,
              symbol: balance.symbol,
              timestamp: Date.now()
            })
            resolve({ balance: balance.formatted, symbol: balance.symbol })
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('Appkit:WagmiAdapter:getBalance - Error getting balance', error)
            resolve({ balance: '0.00', symbol: 'ETH' })
          }
        }
      ).finally(() => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.balancePromises[caipAddress]
      })

      return this.balancePromises[caipAddress] || { balance: '0.00', symbol: 'ETH' }
    }

    return { balance: '', symbol: '' }
  }

  public async getWalletConnectProvider(): AdapterBlueprint.GetWalletConnectProviderResult {
    return await this.connectors.find(c => c.id === 'walletConnect')?.provider as typeof UniversalProvider
  }

  public async disconnect() {
    await disconnectW3()
  }

  public override async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams) {
    await Promise.all([
      switchChain({ chain: Number(params.caipNetwork.id) }),
      super.switchNetwork(params)
    ])
  }

  public async getCapabilities(params: string) {
    const provider = w3vmStore.get('walletProvider') as unknown as Awaited<ReturnType<typeof UniversalProvider['UniversalProvider']['init']>> 

    if (!provider) {
      throw new Error('connectionControllerClient:getCapabilities - provider is undefined')
    }

    const walletCapabilitiesString = provider.session?.sessionProperties?.['capabilities']
    if (walletCapabilitiesString) {
      const walletCapabilities = parseWalletCapabilities(walletCapabilitiesString)
      const accountCapabilities = walletCapabilities[params]
      if (accountCapabilities) {
        return accountCapabilities
      }
    }

    return await provider.request({ method: 'wallet_getCapabilities', params: [params] })
  }

  public async grantPermissions(params: AdapterBlueprint.GrantPermissionsParams) {
    const provider = w3vmStore.get('walletProvider')

    if (!provider) {
      throw new Error('connectionControllerClient:grantPermissions - provider is undefined')
    }

    return provider.request({ method: 'wallet_grantPermissions', params })
  }

  public async revokePermissions(
    params: AdapterBlueprint.RevokePermissionsParams
  ): Promise<`0x${string}`> {
    const provider = w3vmStore.get('walletProvider')

    if (!provider) {
      throw new Error('connectionControllerClient:revokePermissions - provider is undefined')
    }

    return provider.request({ method: 'wallet_revokePermissions', params })
  }

  public async walletGetAssets(
    params: AdapterBlueprint.WalletGetAssetsParams
  ): Promise<AdapterBlueprint.WalletGetAssetsResponse> {
    const provider = w3vmStore.get('walletProvider')

    if (!provider) {
      throw new Error('connectionControllerClient:walletGetAssets - provider is undefined')
    }

    return provider.request({ method: 'wallet_getAssets', params: [params] })
  }

  public override setUniversalProvider(universalProvider: Awaited<ReturnType<typeof UniversalProvider['UniversalProvider']['init']>> ): void {
    universalProvider.on('display_uri', console.log)
    universalProvider.on('connect', () => {
      const connector = this.connectors.find(c => c.id === 'walletConnect') as unknown as Connector
      if (connector) {
        connectW3({
          connector
        })
      }
    })
    this.addConnector(
      new WalletConnectConnector({
        provider: universalProvider,
        caipNetworks: this.getCaipNetworks(),
        namespace: 'eip155'
      })
    )
  }
}
