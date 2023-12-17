import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { initW3, Injected } from '@w3vm/vue'
import { WalletConnect } from '@w3vm/walletconnect'

const projectId = 'cdbd18f9f96172be74c3e351ce99b908'

initW3({
  connectors: [
    new Injected(), 
    new WalletConnect({ 
      projectId,
      showQrModal: true, 
      chains:[1]
    })
  ]
})

createApp(App).mount('#app')
