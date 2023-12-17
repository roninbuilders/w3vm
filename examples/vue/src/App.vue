<script setup lang="ts">
  import { address, chainId, connectors, connectW3, disconnectW3, type Injected } from '@w3vm/vue'

</script>

<template>
  <div v-for="connector in connectors">
    <button @click="()=>connectW3({ connector: connector as Injected })" >
      {{ connector.name }}
    </button>
  </div>
  <div v-if="address" >
    User Address: {{ address }}
    <button @click="disconnectW3" > Disconnect </button>
  </div>
  <div v-if="chainId" >
    User chain ID: {{ chainId }}
  </div>
</template>
