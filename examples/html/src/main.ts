import { initW3, Injected, connectW3, getW3, subW3, disconnectW3 } from '@w3vm/core'

initW3({
  connectors: [
    new Injected(),
  ]
})

const btnEl = document.getElementById("connect")
const userEl = document.getElementById("user")

subW3.address( address => {
  if(!btnEl || !userEl) return
  if(address){
    btnEl.innerText = "Disconnect"
    userEl.innerText = `Address: ${address}`
  }else{
    btnEl.innerText = "Connect"
    userEl.innerText = ""
  }
})

btnEl?.addEventListener('click',()=>{
  const address = getW3.address()
  if(address){
    disconnectW3()
  }else{
    const connectors = getW3.connectors()
    connectW3({ connector: connectors[0] })
  }
})