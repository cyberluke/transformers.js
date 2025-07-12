import { Message } from '@ai-sdk/react';

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  serverChatId?: string;
}

export interface ThreadsResponse {
  threads: Thread[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreateThreadRequest {
  title?: string;
  messages?: Message[];
}

export class ThreadService {
  private static instance: ThreadService;
  
  private constructor() {}
  
  static getInstance(): ThreadService {
    if (!ThreadService.instance) {
      ThreadService.instance = new ThreadService();
    }
    return ThreadService.instance;
  }

  async fetchThreads(fingerprintId: string, cursor?: string): Promise<ThreadsResponse> {
    try {
      const params = new URLSearchParams({
        fingerprint: fingerprintId,
      });

      if (cursor) {
        params.append('cursor', cursor);
      }

      const response = await fetch(`/api/chats?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch threads: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch threads');
      }

      const { chats, nextCursor, hasMore } = result.data;

      // Transform server chats to client threads
      const threads: Thread[] = chats.map((chat: any) => ({
        id: crypto.randomUUID(), // Frontend ID
        title: chat.title || 'Bez názvu',
        messages: [], // Messages will be loaded separately
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        serverChatId: chat.id,
      }));

      return {
        threads,
        nextCursor: hasMore ? nextCursor : null,
        hasMore,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch threads: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async createThread(request: CreateThreadRequest = {}): Promise<Thread> {
    try {
      const newThread: Thread = {
        id: crypto.randomUUID(),
        title: request.title || 'Nový chat',
        messages: request.messages || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return newThread;
    } catch (error) {
      throw new Error(
        `Failed to create thread: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteThread(serverChatId: string): Promise<void> {
    try {
      const response = await fetch(`/api/chats/${serverChatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete thread: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to delete thread: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async loadThreadMessages(serverChatId: string, fingerprintId: string): Promise<Message[]> {
    try {
      const params = new URLSearchParams({
        chatId: serverChatId,
        fingerprint: fingerprintId,
      });

      const response = await fetch(`/api/messages?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load messages');
      }

      return result.data.messages || [];
    } catch (error) {
      throw new Error(
        `Failed to load thread messages: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Default instance getter
export const getThreadService = (): ThreadService => {
  return ThreadService.getInstance();
}; 