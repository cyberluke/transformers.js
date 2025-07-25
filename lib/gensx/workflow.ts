import * as gensx from "@gensx/core";
import { AgentData } from "@/types/agent";
import { Memories } from "./memories";
import { HandleChatInit } from "./chat";
import { StreamingChat } from "./streaming-chat";
import { WriterRef } from "@/types/server";
import { createChatStreamResponse } from "../api/chat/stream-response";
import { AppMessage } from "@/types/messages";
import { HandleChatMessage } from "./message";
import { SelectAgent } from "./agent";

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

    const { memories, memoriesPrompt } = await Memories({
      messages: messages,
      userId: userId,
    });

    await HandleChatMessage({
      userMessage,
      chatId: chat.id,
      userId,
      assistentId: agent.id,
    });

    let writerRef: WriterRef = { value: null };

    const result = await StreamingChat({
      messages: messages,
      chatId: chat.id,
      userId,
      agent,
      memoriesPrompt,
      writerRef,
    });

    return createChatStreamResponse({
      chatId: chat.id,
      memories,
      result,
      messages,
      userId: userId,
      writerRef,
    });
  },
);