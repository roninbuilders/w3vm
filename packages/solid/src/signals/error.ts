import { createSignal } from 'solid-js'
import { w3vmStore } from '@w3vm/core'

const [error, setError] = createSignal(w3vmStore.get('error'))
w3vmStore.subscribe('error', setError)

export { error }
