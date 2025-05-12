import { ref } from 'vue'
import { w3vmStore, type Provider } from '@w3vm/core'

export const walletProvider = ref<Provider | undefined>(w3vmStore.get('walletProvider'))

function onWalletProvider(_provider: Provider | undefined) {
	walletProvider.value = _provider
}

w3vmStore.subscribe('walletProvider', onWalletProvider)
