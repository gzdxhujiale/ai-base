import { create } from 'zustand'

type WorkspaceState = {
  isSidebarCollapsed: boolean
  commandOpen: boolean
  aiDrawerOpen: boolean
  activeAppDetailName: string | null
  activeAppDetailBack: (() => void) | null
  toggleSidebar: () => void
  setCommandOpen: (open: boolean) => void
  setAiDrawerOpen: (open: boolean) => void
  setActiveAppDetail: (name: string | null, onBack?: (() => void) | null) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  isSidebarCollapsed: false,
  commandOpen: false,
  aiDrawerOpen: false,
  activeAppDetailName: null,
  activeAppDetailBack: null,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setAiDrawerOpen: (aiDrawerOpen) => set({ aiDrawerOpen }),
  setActiveAppDetail: (activeAppDetailName, activeAppDetailBack = null) =>
    set({ activeAppDetailName, activeAppDetailBack: activeAppDetailBack ?? null }),
}))
