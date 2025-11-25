import { useQuery } from '@tanstack/solid-query'
import { Switch, Match, For, createSignal } from 'solid-js'

export default function QueryComponent() {
  const [count, setCount] = createSignal(0)

  async function fetchTodos(){
    return await new Promise((resolve)=>{
      setTimeout(() => {
        console.log("Time set")
        resolve([{
          title: count().toString()
        }])
      }, 2000);
    }) as Record<string, string>[]
  }

  const query = useQuery(() => ({
    queryKey: ['todos', count()],
    queryFn: fetchTodos,
  }))

  return (
    <div>
      <Switch>
        <Match when={query.isPending}>
          <p>Loading...</p>
        </Match>
        <Match when={query.isError}>
          <p>Error: {query.error?.message}</p>
        </Match>
        <Match when={query.isSuccess}>
          <For each={query.data}>{(todo) => <p>{todo.title}</p>}</For>
        </Match>
      </Switch>
      <button onClick={()=>setCount(p => p + 1)}>Add: {count()}</button>
      <button onClick={()=>query.refetch()} >refetch</button>
    </div>
  )
}