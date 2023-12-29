import { createSignal } from 'solid-js'
import { subW3, getW3 } from '@w3vm/core'

const [status, setStatus] = createSignal(getW3.status())
subW3.status(setStatus)

export { status }
