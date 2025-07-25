import { createDataStreamResponse } from 'ai';
import { addMemories } from '@/lib/server/mem0/mem0-utils';
import { Writer } from '@/types/server';

interface StreamResponseConfig {
  chatId: string;
  memories: {
    results: any[];
    relations: any[];
  };
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

      console.log(memories, "memories");
      
      // Odeslání existujících memories
      if (memories.results.length > 0) {
        console.log("SENDING MEMORIES");
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
    onError: (error) => {
      console.error("Error in createChatStreamResponse:", error);
      return "Error in createChatStreamResponse";
    }
  });
}; 