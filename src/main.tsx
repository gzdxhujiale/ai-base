import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from '@arco-design/web-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import '@arco-design/web-react/dist/css/arco.css'
import './index.css'
import { router } from './router'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider componentConfig={{ Button: { size: 'default' } }}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ConfigProvider>
  </StrictMode>,
)
