import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { WorkspaceShell } from './features/workspace/WorkspaceShell'

const rootRoute = createRootRoute()

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WorkspaceShell,
})

const workspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$pageId',
  component: WorkspaceShell,
})

const routeTree = rootRoute.addChildren([dashboardRoute, workspaceRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
