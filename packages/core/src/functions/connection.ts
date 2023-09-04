import { KEY_WALLET } from "../constants"
import { getW3 } from "../store/w3store"
import { Chain, Connector } from "../types"

/* Connect & Disconnect Functions */
export async function connectW3({ connector, chain }:{connector: Connector, chain?: Chain | number}): Promise<void>{
  await connector.connect({ chain })
}

export async function disconnectW3(){
  const connectors = getW3.connectors()
  const [connector] = connectors.filter(c => c.id === window?.localStorage.getItem(KEY_WALLET))
  
  if(connector) await connector.disconnect()
  else
  for(let c of connectors) c.disconnect()
}