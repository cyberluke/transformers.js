import { useCallback, useMemo, useEffect } from 'react';
import { useThreadDataStore } from '@/lib/stores/thread-data-store';
import { useThreadUIStore } from '@/lib/stores/thread-ui-store';
import { getThreadService, Thread, CreateThreadRequest } from '@/lib/services/threadService';
import { useFingerprint } from './useFingerprint';
import { AppMessage } from '@/types/messages';

export function useThreads() {
  // Data store
  const {
    threads,
    addThread,
    addThreads,
    removeThread,
    updateThreadMessages,
    addMessageToThread,
    setServerChatId,
    setThreadTitle,
    getThreadById,
    getThreadByServerChatId,
    setThreads,
    clear: clearThreads,
  } = useThreadDataStore();

  // UI store
  const {
    currentThreadId,
    nextCursor,
    error,
    isLoading,
    setCurrentThreadId,
    setNextCursor,
    setError,
    setLoading,
    clearError,
  } = useThreadUIStore();

  // Fingerprint for server operations
  const { fingerprintData } = useFingerprint();

  // Service
  const threadService = getThreadService();

  // Computed values
  const currentThread = useMemo(() => {
    return currentThreadId ? getThreadById(currentThreadId) : null;
  }, [currentThreadId, getThreadById, threads]); // TODO: remove threads from dependencies, and find better solution

  const hasNextPage = useMemo(() => {
    return !!nextCursor;
  }, [nextCursor]);

  const hasServerThreads = useMemo(() => {
    return threads.some(t => t.serverChatId);
  }, [threads]);



  // Load threads from server
  const loadThreads = useCallback(async (cursor?: string) => {
    if (!fingerprintData?.requestId) {
      setError('Fingerprint not available');
      return;
    }

    console.log('loadThreads', fingerprintData.requestId, cursor);

    setLoading(true);
    clearError();

    try {
      const result = await threadService.fetchThreads(fingerprintData.requestId, cursor);
      
      if (cursor) {
        // Pagination - add to existing threads
        addThreads(result.threads);
      } else {
        // console.log('threads', threads);
        // Initial load - replace server threads, keep local ones
        // const localThreads = threads.filter(t => !t.serverChatId);
        // console.log('localThreads', localThreads);
        setThreads(prev => {
          const localThreads = prev.filter(t => !t.serverChatId);
          return [...localThreads, ...result.threads];
        });
      }
      
      setNextCursor(result.nextCursor);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load threads';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fingerprintData?.requestId, threadService, addThreads, setThreads, setNextCursor, setError, setLoading, clearError]);

  // Create new thread
  const createThread = useCallback(async (request: CreateThreadRequest = {}) => {
    if (currentThread && !currentThread.serverChatId) {
      console.log('Cannot create new thread - current thread has no messages sent to server');
      return currentThread.id;
    }

    setLoading(true);
    clearError();

    try {
      const newThread = await threadService.createThread(request);
      addThread(newThread);
      setCurrentThreadId(newThread.id);
      console.log('newThread', newThread);
      return newThread.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create thread';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentThread, threadService, addThread, setCurrentThreadId, setLoading, clearError, setError]);

  // Force create new thread (ignores serverChatId check)
  const forceCreateThread = useCallback(async (request: CreateThreadRequest = {}) => {
    setLoading(true);
    clearError();

    try {
      const newThread = await threadService.createThread(request);
      addThread(newThread);
      setCurrentThreadId(newThread.id);
      console.log('newThread (forced)', newThread);
      return newThread.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create thread';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [threadService, addThread, setCurrentThreadId, setLoading, clearError, setError]);

  // Switch to thread
  const switchThread = useCallback(async (threadId: string) => {
    const thread = getThreadById(threadId);
    if (!thread) {
      setError('Thread not found');
      return;
    }

    setCurrentThreadId(threadId);

    // Load messages if thread has server chat ID but no messages
    if (thread.serverChatId && thread.messages.length === 0 && fingerprintData?.requestId) {
      setLoading(true);
      clearError();

      try {
        const messages = await threadService.loadThreadMessages(thread.serverChatId, fingerprintData.requestId);
        updateThreadMessages(threadId, messages);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  }, [getThreadById, setCurrentThreadId, threadService, updateThreadMessages, setError, fingerprintData?.requestId, setLoading, clearError]);

  // Delete thread
  const deleteThread = useCallback(async (threadId: string) => {
    const thread = getThreadById(threadId);
    if (!thread) {
      setError('Thread not found');
      return;
    }

    setLoading(true);
    clearError();

    try {
      // Delete from server if thread has server chat ID
      if (thread.serverChatId) {
        await threadService.deleteThread(thread.serverChatId);
      }
      
      // Delete locally
      removeThread(threadId);
      
      // Update current thread if deleted
      if (currentThreadId === threadId) {
        const remainingThreads = threads.filter(t => t.id !== threadId);
        setCurrentThreadId(remainingThreads.length > 0 ? remainingThreads[0].id : null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete thread';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getThreadById, threadService, removeThread, currentThreadId, threads, setCurrentThreadId, setError, setLoading, clearError]);

  // Add message to thread
  const addMessage = useCallback((threadId: string, message: AppMessage) => {
    addMessageToThread(threadId, message);
  }, [addMessageToThread]);

  // Update thread messages
  const updateMessages = useCallback((threadId: string, messages: AppMessage[]) => {
    console.log('updateMessages', threadId, messages);
    updateThreadMessages(threadId, messages);
  }, [updateThreadMessages]);

  // Set server chat ID for thread
  const setServerChatIdForThread = useCallback((threadId: string, serverChatId: string) => {
    setServerChatId(threadId, serverChatId);
  }, [setServerChatId]);

  // Set thread title
  const setTitleForThread = useCallback((threadId: string, title: string) => {
    setThreadTitle(threadId, title);
  }, [setThreadTitle]);

  // Load more threads (pagination)
  const loadMoreThreads = useCallback(async () => {
    if (!hasNextPage || isLoading) return;
    await loadThreads(nextCursor || undefined);
  }, [hasNextPage, isLoading, loadThreads, nextCursor]);

  // Note: No auto-initialization - will be handled at app level

  return {
    // State
    threads,
    currentThread,
    currentThreadId,
    error,
    isLoading,
    hasNextPage,
    hasServerThreads,
    
    // Actions
    loadThreads,
    createThread,
    forceCreateThread,
    switchThread,
    deleteThread,
    addMessage,
    updateMessages,
    setServerChatIdForThread,
    setTitleForThread,
    loadMoreThreads,
    clearError,
    clearThreads,
  };
} 