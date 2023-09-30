import type { Web3ModalOptions } from '../src/client'
import { Web3Modal } from '../src/client'
import { VERSION } from '../src/utils/constants'

export type { Web3ModalOptions } from '../src/client'
export { walletConnectProvider } from '../src/utils/provider'

export function createWeb3Modal(options: Web3ModalOptions) {
  return new Web3Modal({ ...options, _sdkVersion: `html-wagmi-${VERSION}` })
}
