import * as gensx from "@gensx/core";
import { createChat, getChat, getChatMessagesWithPagination } from "@/lib/db/actions";
import { Chat } from "@/lib/db/schema";
import { AppMessage } from "@/types/messages";

export const HandleChatInit = gensx.Workflow(
  "HandleChatInit",
  async ({ 
    chatId, 
    userId, 
    userMessage,
    assistentId,
    detailed = false
  }: { 
    chatId?: string, 
    userId: string, 
    userMessage: AppMessage,
    assistentId?: string,
    detailed?: boolean
  }) => {
    let chat: Chat;
    let messages: AppMessage[] = [];

    if (!chatId) {
      // Vytvoř nový chat
      chat = await ChatCreate({
        userId,
        assistentId,
        detailed
      });
      messages.push(userMessage);
    } else {
      // Načti existující chat
      const chatResult = await ChatLoad({
        chatId,
        userId,
      });
      
      chat = chatResult.chat;
      messages = chatResult.messages;
      messages.push(userMessage);
    }

    return {
      chat,
      messages
    };
  },
);

export const ChatCreate = gensx.Component(
  "ChatCreate",
  async ({ 
    userId, 
    assistentId,
    detailed = false 
  }: { 
    userId: string, 
    assistentId?: string,
    detailed?: boolean 
  }) => {
    const chat = await createChat({
      userId,
      assistentId,
      title: 'New Chat',
      metadata: {
        detailed,
      }
    });

    return chat;
  },
);

export const ChatLoad = gensx.Component(
  "ChatLoad",
  async ({ 
    chatId, 
    userId
  }: { 
    chatId: string, 
    userId: string, 
  }) => {
    const chat = await getChat(chatId, userId);
    
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    const messageCount = chat.metadata?.detailed ? 100 : 10; // Todo, agent ovlivnit nebo ne
    const rawMessages = await getChatMessagesWithPagination(chatId, userId, undefined, messageCount);
    
    return {
      chat,
      messages: rawMessages.messages
    };
  },
);