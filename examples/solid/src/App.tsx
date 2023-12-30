import { For } from 'solid-js'
import './App.css'

import { address, connectors, connectW3, initW3, status } from '@w3vm/solid'
import { WalletConnect } from '@w3vm/walletconnect'
import { effect } from 'solid-js/web'

function App() {
  const projectId = 'YOUR_PROJECT_ID'

  initW3({ 
    connectors: [
      new WalletConnect({ 
        projectId, 
        chains: [1, 137], 
        showQrModal: true
      })
    ]
  })

  effect(()=>{
    console.log(status(), address())
  })
  
  return (
    <For each={connectors()}>
      {connector =>(
      <button disabled={Boolean(status())} onClick={()=>connectW3({ connector })}>
        <img src={connector.icon} alt={connector.name} />
        {connector.name}
      </button>
      )}
    </For>
  )
}

export default App
