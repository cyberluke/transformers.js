import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface SimpleSidebarStore {
  // State
  isOpen: boolean;          // true = otevřený, false = collapsed (desktop)
  openMobile: boolean;      // true/false pro mobile Sheet
  
  // Actions
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: (isMobile: boolean) => void;
  setCollapsed: () => void;  // Nastaví collapsed stav (false)
  setExpanded: () => void;   // Nastaví expanded stav (true)
}

export const useSidebarStore = create<SimpleSidebarStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isOpen: true,
      openMobile: false,
      
      // Actions
      setOpen: (isOpen: boolean) => {
        set({ isOpen });
      },
      
      setOpenMobile: (openMobile: boolean) => {
        set({ openMobile });
      },
      
      toggleSidebar: (isMobile: boolean) => {
        const state = get();
        if (isMobile) {
          set({ openMobile: !state.openMobile });
        } else {
          set({ isOpen: !state.isOpen });
        }
      },
      
      setCollapsed: () => {
        set({ isOpen: false });
      },
      
      setExpanded: () => {
        set({ isOpen: true });
      }
    }),
    { 
      name: 'simple-sidebar-store',
      partialize: (state) => ({ isOpen: state.isOpen })
    }
  )
);
