import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Message } from '@ai-sdk/react';

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  serverChatId?: string; // Server-generated chat ID
}

interface ThreadStore {
  threads: Thread[];
  currentThreadId: string | null;
  
  // Computed
  currentThread: Thread | null;
  
  // Actions
  createThread: () => string;
  switchThread: (threadId: string) => void;
  updateThread: (threadId: string, updates: Partial<Thread>) => void;
  addMessageToThread: (threadId: string, message: Message) => void;
  updateThreadMessages: (threadId: string, messages: Message[]) => void;
  setServerChatId: (threadId: string, serverChatId: string) => void;
  deleteThread: (threadId: string) => void;
  generateThreadTitle: (messages: Message[]) => string;
}

export const useThreadStore = create<ThreadStore>()(
  persist(
    (set, get) => ({
      threads: [],
      currentThreadId: null,
      
      get currentThread() {
        const { threads, currentThreadId } = get();
        return threads.find(thread => thread.id === currentThreadId) || null;
      },
      
      createThread: () => {
        const newThread: Thread = {
          id: crypto.randomUUID(),
          title: 'Nový chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => ({
          threads: [newThread, ...state.threads],
          currentThreadId: newThread.id,
        }));
        
        return newThread.id;
      },
      
      switchThread: (threadId: string) => {
        set({ currentThreadId: threadId });
      },
      
      updateThread: (threadId: string, updates: Partial<Thread>) => {
        set(state => ({
          threads: state.threads.map(thread =>
            thread.id === threadId
              ? { ...thread, ...updates, updatedAt: new Date() }
              : thread
          ),
        }));
      },
      
      addMessageToThread: (threadId: string, message: Message) => {
        set(state => ({
          threads: state.threads.map(thread =>
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
      
      updateThreadMessages: (threadId: string, messages: Message[]) => {
        const { generateThreadTitle } = get();
        
        set(state => ({
          threads: state.threads.map(thread =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages,
                  title: messages.length > 0 ? generateThreadTitle(messages) : 'Nový chat',
                  updatedAt: new Date(),
                }
              : thread
          ),
        }));
      },
      
      setServerChatId: (threadId: string, serverChatId: string) => {
        set(state => ({
          threads: state.threads.map(thread =>
            thread.id === threadId
              ? { ...thread, serverChatId, updatedAt: new Date() }
              : thread
          ),
        }));
      },
      
      deleteThread: (threadId: string) => {
        set(state => {
          const newThreads = state.threads.filter(thread => thread.id !== threadId);
          const newCurrentThreadId = 
            state.currentThreadId === threadId 
              ? (newThreads.length > 0 ? newThreads[0].id : null)
              : state.currentThreadId;
          
          return {
            threads: newThreads,
            currentThreadId: newCurrentThreadId,
          };
        });
      },
      
      generateThreadTitle: (messages: Message[]) => {
        const firstUserMessage = messages.find(m => m.role === 'user');
        if (!firstUserMessage) return 'Nový chat';
        
        // Zkrátí na první větu nebo 50 znaků
        const content = firstUserMessage.content;
        const firstSentence = content.split(/[.!?]/)[0];
        const title = firstSentence.length > 50 
          ? content.substring(0, 47) + '...'
          : firstSentence;
        
        return title || 'Nový chat';
      },
    }),
    {
      name: 'chat-threads',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 