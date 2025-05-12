import { ref } from 'vue'
import { w3vmStore } from '@w3vm/core'

export const address = ref<string | undefined>(w3vmStore.get('address'))

function onAddress(_address: string | undefined) {
	address.value = _address
}

w3vmStore.subscribe('address', onAddress)
