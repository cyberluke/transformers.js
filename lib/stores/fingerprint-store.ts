import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { GetResult } from "@fingerprintjs/fingerprintjs-pro";

interface FingerprintState {
  fingerprintData: GetResult | null;
  isLoading: boolean;
  error: string | null;
  
  // Pure state mutations
  setFingerprintData: (data: GetResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useFingerprintStore = create<FingerprintState>()(
  persist(
    (set) => ({
      fingerprintData: null,
      isLoading: false,
      error: null,
      
      setFingerprintData: (data) => {
        set({ fingerprintData: data });
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
          fingerprintData: null, 
          isLoading: false, 
          error: null 
        });
      },
    }),
    {
      name: 'fingerprint-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 