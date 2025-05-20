import './App.css'
import { createAppKit } from '@reown/appkit'
import { W3vmAdapter } from '@w3vm/appkit-adapter'
import { Injected } from '@w3vm/solid'
import { WalletConnect } from '@w3vm/walletconnect'
import { arbitrum, mainnet } from '@reown/appkit/networks'

const projectId = 'cdbd18f9f96172be74c3e351ce99b908'

const networks = [mainnet, arbitrum]

const w3vmAdapter = new W3vmAdapter({
  networks,
  connectors: [new Injected(),new WalletConnect({projectId, chains: [mainnet.id, arbitrum.id]})],
  projectId
})

const metadata = {
  name: 'AppKit',
  description: 'AppKit Example',
  url: 'https://example.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}
const modal = createAppKit({
  adapters: [w3vmAdapter], 
  networks: [mainnet, arbitrum],
  metadata,
  projectId,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

function App() {
  return (
    <div>
      <h1>W3vm + AppKit</h1>
        <button onClick={()=>modal.open()}>
          Open Modal
        </button>
        <appkit-button />
        <appkit-network-button />
    </div>
  )
}

export default App

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'appkit-button': unknown
      'appkit-network-button': unknown
		}
	}
}