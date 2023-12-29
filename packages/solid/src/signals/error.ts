import { createSignal } from 'solid-js'
import { subW3, getW3 } from '@w3vm/core'

const [error, setError] = createSignal(getW3.error())
subW3.error(setError)

export { error }