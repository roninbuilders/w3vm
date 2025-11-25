import { createSignal } from 'solid-js'
import { w3vmStore } from '@w3vm/core'

const [status, setStatus] = createSignal(w3vmStore.get('status'))
w3vmStore.subscribe('status', setStatus)

export { status }
