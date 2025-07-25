import { create } from 'zustand';
import { Thread } from '@/lib/services/threadService';
import { AppMessage } from '@/types/messages';

interface ThreadDataState {
  threads: Thread[];
  
  // Pure state mutations
  setThreads: (updater: Thread[] | ((prev: Thread[]) => Thread[])) => void;
  addThread: (thread: Thread) => void;
  addThreads: (threads: Thread[]) => void;
  removeThread: (threadId: string) => void;
  updateThreadMessages: (threadId: string, messages: AppMessage[]) => void;
  addMessageToThread: (threadId: string, message: AppMessage) => void;
  setServerChatId: (threadId: string, serverChatId: string) => void;
  setThreadTitle: (threadId: string, title: string) => void;
  clear: () => void;
  
  // Computed getters
  getThreadById: (threadId: string) => Thread | null;
  getThreadByServerChatId: (serverChatId: string) => Thread | null;
  getThreadCount: () => number;
}

export const useThreadDataStore = create<ThreadDataState>()((set, get) => ({
  threads: [],
  
  setThreads: (updater) => {
    set(state => ({
      threads: typeof updater === 'function' ? updater(state.threads) : updater,
    }));
  },
  
  addThread: (thread) => {
    set((state) => ({
      threads: [thread, ...state.threads],
    }));
  },
  
  addThreads: (newThreads) => {
    set((state) => ({
      threads: [...state.threads, ...newThreads],
    }));
  },
  
  removeThread: (threadId) => {
    set((state) => ({
      threads: state.threads.filter((thread) => thread.id !== threadId),
    }));
  },
  
  updateThreadMessages: (threadId, messages) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? { ...thread, messages, updatedAt: new Date() }
          : thread
      ),
    }));
  },
  
  addMessageToThread: (threadId, message) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              messages: [...thread.messages, message],
              updatedAt: new Date(),
            }
          : thread
      ),
    }));
  },
  
  setServerChatId: (threadId, serverChatId) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? { ...thread, serverChatId, updatedAt: new Date() }
          : thread
      ),
    }));
  },
  
  setThreadTitle: (threadId, title) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? { ...thread, title, updatedAt: new Date() }
          : thread
      ),
    }));
  },
  
  clear: () => {
    set({ threads: [] });
  },
  
  // Computed getters
  getThreadById: (threadId) => {
    const { threads } = get();
    return threads.find((thread) => thread.id === threadId) || null;
  },
  
  getThreadByServerChatId: (serverChatId) => {
    const { threads } = get();
    return threads.find((thread) => thread.serverChatId === serverChatId) || null;
  },
  
  getThreadCount: () => {
    const { threads } = get();
    return threads.length;
  },
})); 