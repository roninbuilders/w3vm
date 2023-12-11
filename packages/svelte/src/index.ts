export { getW3Address } from './readables/getW3Address'
export { getW3Chain } from './readables/getW3Chain'
export { getW3Provider } from './readables/getW3Provider'
export { useConnect } from './readables/useConnect'
export { getW3Error } from './readables/getW3Error'

export {
  getW3,
  setW3,
  subW3,
  Injected,
  initEIP6963,
  initW3,
} from '@w3vm/core'

export type {
  Chain,
  Provider,
  EIP1193Provider,
  ProviderRpcError
} from '@w3vm/core'