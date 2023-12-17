import { ref } from 'vue'
import { subW3, getW3, type Provider } from '@w3vm/core'

export const walletProvider = ref<Provider | undefined>(getW3.walletProvider())

function onWalletProvider(_provider: Provider | undefined) {
	walletProvider.value = _provider
}

subW3.walletProvider(onWalletProvider)
