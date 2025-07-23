import { createDataStreamResponse } from 'ai';
import { addMemories } from '@/lib/server/mem0/mem0-utils';
import { Writer } from '@/types/server';

interface StreamResponseConfig {
  chatId: string;
  memories: any[];
  result: any;
  messages: any[];
  userId: string;
  writerRef: { value: Writer | null };
}

export const createChatStreamResponse = (config: StreamResponseConfig) => {
  const { chatId, memories, result, messages, userId, writerRef } = config;
  
  return createDataStreamResponse({
    execute: async (writer) => {
      writerRef.value = writer;

      // Odeslání chat ID
      writer.writeData({
        type: "chat-id",
        chatId,
      });
      
      // Odeslání existujících memories
      if (memories.length > 0) {
        writer.writeMessageAnnotation({
          type: "mem0-get",
          memories,
        });
      }

      // Merge streamu s výsledky
      result.mergeIntoDataStream(writer);
      console.log("MERGED INTO DATA STREAM");

      // Přidání nových memories (asynchronně)
      const addMemoriesTask = addMemories(messages, { user_id: userId });
      const newMemories = await addMemoriesTask;
      
      if (newMemories.length > 0) {
        writer.writeMessageAnnotation({
          type: "mem0-update",
          memories: newMemories,
        });
      }

      console.log("ADDED MEMORIES");
    },
  });
}; 