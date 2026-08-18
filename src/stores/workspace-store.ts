import { create } from 'zustand'
import type { AppItem } from '../features/application-center/types'

type WorkspaceState = {
  isSidebarCollapsed: boolean
  commandOpen: boolean
  aiDrawerOpen: boolean
  activeAppDetailName: string | null
  activeAppDetailBack: (() => void) | null
  workbenchApps: AppItem[]
  pendingWorkbenchAppId: string | null
  toggleSidebar: () => void
  setCommandOpen: (open: boolean) => void
  setAiDrawerOpen: (open: boolean) => void
  setActiveAppDetail: (name: string | null, onBack?: (() => void) | null) => void
  addWorkbenchApp: (app: AppItem) => void
  removeWorkbenchApp: (id: string) => void
  setPendingWorkbenchAppId: (id: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  isSidebarCollapsed: false,
  commandOpen: false,
  aiDrawerOpen: false,
  activeAppDetailName: null,
  activeAppDetailBack: null,
  workbenchApps: [],
  pendingWorkbenchAppId: null,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setAiDrawerOpen: (aiDrawerOpen) => set({ aiDrawerOpen }),
  setActiveAppDetail: (activeAppDetailName, activeAppDetailBack = null) =>
    set({ activeAppDetailName, activeAppDetailBack: activeAppDetailBack ?? null }),
  addWorkbenchApp: (app) => set((state) => ({
    workbenchApps: state.workbenchApps.some((item) => item.id === app.id) ? state.workbenchApps : [...state.workbenchApps, app],
  })),
  removeWorkbenchApp: (id) => set((state) => ({
    workbenchApps: state.workbenchApps.filter((item) => item.id !== id),
  })),
  setPendingWorkbenchAppId: (pendingWorkbenchAppId) => set({ pendingWorkbenchAppId }),
}))
