import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@arco-design/web-react/es/_util/react-19-adapter'
import { ConfigProvider } from '@arco-design/web-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import '@arco-design/web-react/dist/css/arco.css'
import './index.css'
import { router } from './router'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })

if (typeof window !== 'undefined') {
  // 解决 Chrome 130+ 报 "Blocked aria-hidden on an element because its descendant retained focus" 违规
  document.addEventListener(
    'focusin',
    (e) => {
      const target = e.target as HTMLElement | null
      if (target && target.getAttribute('aria-hidden') === 'true') {
        target.removeAttribute('aria-hidden')
        target.addEventListener(
          'blur',
          () => {
            target.setAttribute('aria-hidden', 'true')
          },
          { once: true },
        )
      }
    },
    true,
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider componentConfig={{ Button: { size: 'default' } }}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ConfigProvider>
  </StrictMode>,
)
