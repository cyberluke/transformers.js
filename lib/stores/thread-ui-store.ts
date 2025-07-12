import { create } from 'zustand';

interface ThreadUIState {
  currentThreadId: string | null;
  nextCursor: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Pure state mutations
  setCurrentThreadId: (threadId: string | null) => void;
  setNextCursor: (cursor: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useThreadUIStore = create<ThreadUIState>()((set) => ({
  currentThreadId: null,
  nextCursor: null,
  isLoading: false,
  error: null,
  
  setCurrentThreadId: (threadId) => {
    set({ currentThreadId: threadId });
  },
  
  setNextCursor: (cursor) => {
    set({ nextCursor: cursor });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  setError: (error) => {
    set({ error });
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  reset: () => {
    set({
      currentThreadId: null,
      nextCursor: null,
      isLoading: false,
      error: null,
    });
  },
})); 