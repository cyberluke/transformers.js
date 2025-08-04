import { createDataStreamResponse } from 'ai';
import { addMemories, MemoriesResponse } from '@/lib/server/mem0/mem0-utils';
import { AgentData } from '@/types/agent';
import { WriterRef } from '@/types/server';

interface StreamResponseConfig {
  chatId: string;
  memories: MemoriesResponse;
  result: any;
  messages: any[];
  userId: string;
  agent: AgentData;
  writerRef: WriterRef;
}

export const createChatStreamResponse = (config: StreamResponseConfig) => {
  const { chatId, memories, result, messages, userId, agent, writerRef } = config;
  
  return createDataStreamResponse({
    execute: async (writer) => {
      writerRef.value = writer;

      writer.writeData({
        type: "chat-id",
        chatId,
      });

      if (agent.chatConfig.enableMemories && memories.results.length > 0) {
        // writer.writeMessageAnnotation({
        //   type: "mem0-get",
        //   memories
        // });
      }

      result.mergeIntoDataStream(writer);

      if (agent.chatConfig.enableMemories) {
        const addMemoriesTask = addMemories(messages, { user_id: userId });
        const newMemories = await addMemoriesTask;
        
        if (newMemories.length > 0) {
          writer.writeMessageAnnotation({
            type: "mem0-update",
            memories: newMemories,
          });
        }
      }

    },
    onError: (error) => {
      console.error("Error in createChatStreamResponse:", error);
      return "Error in createChatStreamResponse";
    }
  });
}; 