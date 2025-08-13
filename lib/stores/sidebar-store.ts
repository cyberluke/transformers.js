"use client";

import * as React from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Konstanty
export const SIDEBAR_COOKIE_NAME = "sidebar_state";
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const SIDEBAR_WIDTH = "16rem";
export const SIDEBAR_WIDTH_MOBILE = "18rem";
export const SIDEBAR_WIDTH_ICON = "4rem";
export const SIDEBAR_KEYBOARD_SHORTCUT = "b";

// Typy
export type SidebarState = "expanded" | "collapsed";

interface SidebarStore {
  // Desktop state
  open: boolean;
  state: SidebarState;
  
  // Mobile state  
  openMobile: boolean;
  
  // Actions
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: (isMobile: boolean) => void;
  
  // Computed
  getState: () => SidebarState;
}

export const useSidebarStore = create<SidebarStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        open: true,
        state: "expanded",
        openMobile: false,
        
        // Actions
        setOpen: (open: boolean) => {
          set((state) => ({
            ...state,
            open,
            state: open ? "expanded" : "collapsed"
          }));
          
          // Save to cookie for SSR compatibility
          if (typeof document !== 'undefined') {
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
          }
        },
        
        setOpenMobile: (openMobile: boolean) => {
          set((state) => ({ ...state, openMobile }));
        },
        
        toggleSidebar: (isMobile: boolean) => {
          const currentState = get();
          if (isMobile) {
            get().setOpenMobile(!currentState.openMobile);
          } else {
            get().setOpen(!currentState.open);
          }
        },
        
        // Computed getter
        getState: () => {
          const currentState = get();
          return currentState.open ? "expanded" : "collapsed";
        }
      }),
      { 
        name: 'sidebar-store',
        // Only persist desktop state, not mobile
        partialize: (state) => ({ 
          open: state.open,
          state: state.state 
        })
      }
    ),
    { name: 'sidebar-store' }
  )
);

// Custom hook pro kompatibilitu s původním API
export function useSidebar() {
  const {
    open,
    state,
    openMobile,
    setOpen,
    setOpenMobile,
    toggleSidebar: toggleSidebarAction,
    getState
  } = useSidebarStore();
  
  // Import mobile detection hook dynamically to avoid SSR issues
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const toggleSidebar = React.useCallback(() => {
    toggleSidebarAction(isMobile);
  }, [isMobile, toggleSidebarAction]);
  
  return {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar
  };
}
