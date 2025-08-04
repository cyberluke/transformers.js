import * as gensx from "@gensx/core";
import { Memories } from "./memories";
import { HandleChatInit } from "./chat";
import { StreamingChat } from "./streaming-chat";
import { WriterRef } from "@/types/server";
import { createChatStreamResponse } from "../api/chat/stream-response";
import { AppMessage } from "@/types/messages";
import { HandleChatMessage } from "./message";
import { SelectAgent } from "./agent";
import { RAGWorkflow } from "./relevantContent";
import { MemoriesResponse } from "../server/mem0/mem0-utils";

export const ChatWorkflow = gensx.Workflow(
  "ChatWorkflow",
  async ({ 
    // messages, 
    userMessage,
    chatId, 
    userId,
    agentId,
  }: { 
    // messages: LanguageModelV1Prompt, 
    userMessage: AppMessage,
    userId: string, 
    agentId: string 
    chatId?: string,
  }) => {
    const agent = SelectAgent({
      agentId,
    });

    if (!agent) {
      throw new Error("Agent not found");
    }

    const { chat, messages } = await HandleChatInit({
      chatId,
      userId,
      assistentId: agent.id,
      userMessage,
      detailed: false,
    });

    const memories = {
      prompt: "",
      data: {} as MemoriesResponse
    };

    if (agent.chatConfig.enableMemories) {
      const memoriesResult = await Memories({
        messages: messages,
        userId: userId,
      });

      memories.prompt = memoriesResult.prompt;
      memories.data = memoriesResult.memories;
    }

    // RAG workflow - najdi relevantní obsah z dokumentů
    let ragContext: string | undefined;
    if (agent.chatConfig.enableRAG) {
      const ragResult = await RAGWorkflow({
        messages: messages,
        userId: userId,
        assistantId: agent.id,
      });

      ragContext = ragResult.ragContext;
    }

    await HandleChatMessage({
      userMessage,
      chatId: chat.id,
      userId,
      agentId: agent.id,
    });

    let writerRef: WriterRef = { value: null };

    const result = await StreamingChat({
      messages: messages,
      chatId: chat.id,
      userId,
      agent,
      memoriesPrompt: memories.prompt,
      ragContext,
      writerRef,
    });

    return createChatStreamResponse({
      chatId: chat.id,
      memories: memories.data,
      result,
      messages,
      userId: userId,
      agent,
      writerRef,
    });
  },
);