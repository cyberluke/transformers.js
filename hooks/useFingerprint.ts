import { useCallback } from 'react';
import { useFingerprintStore } from '@/lib/stores/fingerprint-store';
import { getFingerprintService } from '@/lib/services/fingerprintService';

export function useFingerprint() {
  const {
    fingerprintData,
    isLoading,
    error,
    setFingerprintData,
    setLoading,
    setError,
    clearError,
    reset,
  } = useFingerprintStore();

  // Orchestration layer - connects service and store
  const fetchFingerprint = useCallback(async (force = false) => {
    if (!force && (fingerprintData || isLoading)) return; // Guard against duplicate initialization
    
    setLoading(true);
    clearError();

    try {
      const service = getFingerprintService();
      await service.initialize(); // Service handles singleton logic
      const data = await service.getFingerprintData();
      setFingerprintData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fingerprint error');
    } finally {
      setLoading(false);
    }
  }, [fingerprintData, isLoading, setFingerprintData, setLoading, setError, clearError]);

  const initialize = useCallback(() => fetchFingerprint(false), [fetchFingerprint]);
  const refresh = useCallback(() => fetchFingerprint(true), [fetchFingerprint]);

  return {
    // State
    fingerprintData,
    isLoading,
    error,
    isInitialized: !!fingerprintData,
    
    // Actions
    initialize,
    refresh,
    clearError,
    reset,
  };
} 