import type {
  CaipAddress,
  CaipNetwork,
  CaipNetworkId,
  ConnectionControllerClient,
  LibraryOptions,
  NetworkControllerClient,
  Token
} from '@web3modal/scaffold'
import { Web3ModalScaffold } from '@web3modal/scaffold'
import {
  ADD_CHAIN_METHOD,
  NAMESPACE,
  VERSION,
  WALLET_CHOICE_KEY,
  WALLET_CONNECT_CONNECTOR_ID
} from './utils/constants'
import { caipNetworkIdToNumber, getCaipDefaultChain, getCaipTokens } from './utils/helpers'
import {
  ConnectorExplorerIds,
  ConnectorImageIds,
  ConnectorNamesMap,
  ConnectorTypesMap,
  NetworkImageIds
} from './utils/presets'

import { switchChain, getW3, subW3, connectW3, disconnectW3, Connector } from '@w3vm/core'
import type { Chain } from '@w3vm/core'
import { subWC } from '@w3vm/walletconnect'
import type EthereumProvider from "@walletconnect/ethereum-provider"

export type Plugin = {
  fetchEnsName: ({ address, chainId }: { address: string, chainId: number })=>Promise<string>
  fetchEnsAvatar: ({ name, chainId }: { name: string, chainId: number })=>Promise<string>
  fetchBalance: ({ address, chainId, token }: { address: string, chainId: number, token?: string })=>Promise<{ formatted: string, symbol: string }>
}

// -- Types ---------------------------------------------------------------------
export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  chains?: (Chain | number)[]
  defaultChain?: Chain | number
  chainImages?: Record<number, string>
  tokens?: Record<number, Token>
  plugin: Plugin
}

export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion'>

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  private hasSyncedConnectedAccount = false

  private options: Web3ModalClientOptions | undefined = undefined
  private fetchEnsName: ({ address, chainId }: { address: string, chainId: number })=>Promise<string>
  private fetchEnsAvatar: ({ name, chainId }: { name: string, chainId: number })=>Promise<string>
  private fetchBalance: ({ address, chainId, token }: { address: string, chainId: number, token?: string })=>Promise<{ formatted: string, symbol: string }>

  public constructor(options: Web3ModalClientOptions) {
    const { chains, plugin, defaultChain, tokens, chainImages, _sdkVersion, ...w3mOptions } = options

    if (!w3mOptions.projectId) {
      throw new Error('web3modal:constructor - projectId is undefined')
    }

    if (!getW3.connectors().find(c => c.id === WALLET_CONNECT_CONNECTOR_ID)) {
      throw new Error('web3modal:constructor - WalletConnectConnector is required')
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chain = caipNetworkIdToNumber(caipNetwork?.id)
        if (chain) {
          await switchChain({ chain })
        }
      },

      //TODO - change any type
      async getApprovedCaipNetworksData(): Promise<any> {
        const walletChoice = localStorage.getItem(WALLET_CHOICE_KEY)
        if (walletChoice?.includes(WALLET_CONNECT_CONNECTOR_ID)) {
          const connector = getW3.connectors().find(c => c.id === WALLET_CONNECT_CONNECTOR_ID)
          if (!connector) {
            throw new Error(
              'networkControllerClient:getApprovedCaipNetworks - connector is undefined'
            )
          }
          const provider = await connector.getProvider()
          const ns = (provider as EthereumProvider).signer?.session?.namespaces
          const nsMethods = ns?.[NAMESPACE]?.methods
          const nsChains = ns?.[NAMESPACE]?.chains

          return {
            supportsAllNetworks: nsMethods?.includes(ADD_CHAIN_METHOD),
            approvedCaipNetworkIds: nsChains as CaipNetworkId[]
          }
        }

        return { approvedCaipNetworkIds: undefined, supportsAllNetworks: true }
      }
    }

    const connectionControllerClient: ConnectionControllerClient = {
      connectWalletConnect: async onUri => {
        const connector = getW3.connectors().find(c => c.id === WALLET_CONNECT_CONNECTOR_ID)
        if (!connector) {
          throw new Error('connectionControllerClient:getWalletConnectUri - connector is undefined')
        }
        subWC.uri(onUri)

        const chain = caipNetworkIdToNumber(this.getCaipNetwork()?.id)

        await connectW3({ connector, chain })
      },

      connectExternal: async id => {
        const connector = getW3.connectors().find(c => c.id === id)
        if (!connector) {
          throw new Error('connectionControllerClient:connectExternal - connector is undefined')
        }

        const chain = caipNetworkIdToNumber(this.getCaipNetwork()?.id)

        await connectW3({ connector, chain })
      },

      checkInjectedInstalled(ids) {
        if (!window?.ethereum) {
          return false
        }

        if (!ids) {
          return Boolean(window.ethereum)
        }

        //@ts-ignore allow extend injected provider
        return ids.some(id => Boolean((window.ethereum)?.[String(id)]))
      },

      disconnect: disconnectW3
    }

    super({
      networkControllerClient,
      connectionControllerClient,
      defaultChain: getCaipDefaultChain(defaultChain),
      tokens: getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `html-w3vm-${VERSION}`,
      ...w3mOptions
    })

    this.options = options

    this.fetchEnsName = plugin.fetchEnsName
    this.fetchEnsAvatar = plugin.fetchEnsAvatar
    this.fetchBalance = plugin.fetchBalance

    this.syncRequestedNetworks(chains, chainImages)

    this.syncConnectors(getW3.connectors())

    subW3.connectors((connectors) => this.syncConnectors(connectors))

    subW3.address(() => this.syncAccount())

    subW3.chainId(() => this.syncNetwork(chainImages))
  }

  // -- Public ------------------------------------------------------------------

  // @ts-expect-error: Overriden state type is correct
  public override getState() {
    const state = super.getState()

    return {
      ...state,
      selectedNetworkId: caipNetworkIdToNumber(state.selectedNetworkId)
    }
  }

  // @ts-expect-error: Overriden state type is correct
  public override subscribeState(callback: (state: Web3ModalState) => void) {
    return super.subscribeState(state =>
      callback({
        ...state,
        selectedNetworkId: caipNetworkIdToNumber(state.selectedNetworkId)
      })
    )
  }

  // -- Private -----------------------------------------------------------------
  private syncRequestedNetworks(
    chains: Web3ModalClientOptions['chains'],
    chainImages?: Web3ModalClientOptions['chainImages']
  ) {
    const requestedCaipNetworks = chains?.map(
      chain =>{
        const chainId = typeof chain === 'number' ? chain : Number(chain.chainId)
        const name = typeof chain === 'number' ? "" : chain.chainName
        return {
          id: `${NAMESPACE}:${chainId}`,
          name,
          imageId: NetworkImageIds[chainId],
          imageUrl: chainImages?.[chainId]
        } as CaipNetwork
      }

    )
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? [])
  }

  //TODO - Balance / Account sync
  private async syncAccount() {
    const address = getW3.address()
    const chainId = getW3.chainId()
    this.resetAccount()
    if (address && chainId) {
      const caipAddress: CaipAddress = `${NAMESPACE}:${chainId}:${address}`
      this.setIsConnected(Boolean(address))
      this.setCaipAddress(caipAddress)
      await Promise.all([
        this.syncProfile(address),
        this.syncBalance(address, chainId),
        this.getApprovedCaipNetworksData()
      ])
      this.hasSyncedConnectedAccount = true
    } else if (!address && this.hasSyncedConnectedAccount) {
      this.resetWcConnection()
      this.resetNetwork()
    }
  }

  //TODO - balance
  private async syncNetwork(chainImages?: Web3ModalClientOptions['chainImages']) {
    const address = getW3.address()
    const chainId = getW3.chainId()
    if (chainId) {
      const caipChainId: CaipNetworkId = `${NAMESPACE}:${chainId}`
      this.setCaipNetwork({
        id: caipChainId,
        //name: chain.name,
        imageId: NetworkImageIds[chainId],
        imageUrl: chainImages?.[chainId]
      })
      if (address) {
        const caipAddress: CaipAddress = `${NAMESPACE}:${chainId}:${address}`
        this.setCaipAddress(caipAddress)
        if (this.hasSyncedConnectedAccount) {
          await this.syncBalance(address, chainId)
        }
      }
    }
  }

  //TODO - sync profile
  private async syncProfile(address: string) {
    try {
      const { name, avatar } = await this.fetchIdentity({
        caipChainId: `${NAMESPACE}:${1}`,
        address
      })
      this.setProfileName(name)
      this.setProfileImage(avatar)
    } catch {
      const profileName = await this.fetchEnsName({ address, chainId: 1 })
      if (profileName) {
        this.setProfileName(profileName)
        const profileImage = await this.fetchEnsAvatar({ name: profileName, chainId: 1 })
        if (profileImage) {
          this.setProfileImage(profileImage)
        }
      }
    }
  }

  //TODO - sync balance
  private async syncBalance(address: string, chainId: number) {
    const balance = await this.fetchBalance({
      address,
      chainId: chainId,
      token: this.options?.tokens?.[chainId]?.address
    })
    this.setBalance(balance.formatted, balance.symbol)
  }

  private syncConnectors(connectors: Connector[]) {
    const w3mConnectors = connectors.map(
      ({ id, name }: {id: string, name: string}) =>
        ({
          id,
          explorerId: ConnectorExplorerIds[id],
          imageId: ConnectorImageIds[id],
          name: ConnectorNamesMap[id] ?? name,
          type: ConnectorTypesMap[id] ?? 'EXTERNAL'
        }) as const
    )
    this.setConnectors(w3mConnectors ?? [])
  }
}