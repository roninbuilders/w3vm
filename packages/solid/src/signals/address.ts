import { createSignal } from 'solid-js'
import { subW3, getW3 } from '@w3vm/core'

const [address, setAddress] = createSignal(getW3.address())
subW3.address(setAddress)

export { address }
