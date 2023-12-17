import { ref } from 'vue'
import { subW3, getW3 } from '@w3vm/core'

export const address = ref<string | undefined>(getW3.address())

function onAddress(_address: string | undefined){
  address.value = _address
}

subW3.address(onAddress)