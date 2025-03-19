import { create } from 'zustand';

interface SidebarStore {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<SidebarStore>()((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
})); 