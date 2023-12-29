import { createSignal } from 'solid-js'
import { subW3, getW3 } from '@w3vm/core'

const [chainId, setChainId] = createSignal(getW3.chainId())
subW3.chainId(setChainId)

export { chainId }
