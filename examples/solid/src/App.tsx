import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import './App.css'
import QueryComponent from './Query'

const queryClient = new QueryClient()

function App() {  
  return (
    <QueryClientProvider client={queryClient}>
      <QueryComponent />
    </QueryClientProvider>
    )
}

export default App
