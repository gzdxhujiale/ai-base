import { create } from 'zustand'

type WorkspaceState = {
  isSidebarCollapsed: boolean
  commandOpen: boolean
  aiDrawerOpen: boolean
  toggleSidebar: () => void
  setCommandOpen: (open: boolean) => void
  setAiDrawerOpen: (open: boolean) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  isSidebarCollapsed: false,
  commandOpen: false,
  aiDrawerOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setAiDrawerOpen: (aiDrawerOpen) => set({ aiDrawerOpen }),
}))
