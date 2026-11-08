import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'jotai'
import { queryClientAtom } from './store/queryAtoms'
import { useHydrateAtoms } from 'jotai/utils'
import App from './App.tsx'
import './index.css'
import { installFetchMock } from './mocks/install'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000
    },
  },
})

const HydrateAtoms = ({ children }: { children: React.ReactNode }) => {
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return <>{children}</>
}

// Static Pages build: no backend — serve /api/* from the bundled mock before the app mounts.
installFetchMock()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider>
        <HydrateAtoms>
          <App />
        </HydrateAtoms>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>,
)

