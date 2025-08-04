import * as gensx from "@gensx/core";
import { streamText } from "@gensx/vercel-ai";
import { NoSuchToolError } from "ai";
import { createFinishHandler } from "../api/chat/finish-handler";
import { RepairArgs } from "./repair";
import { AgentData } from "@/types/agent";
import { SystemPrompt } from "./system";

import { generateChatTitleTool } from "../tools/chat-title";
import { searchWebTool } from "@/lib/tools/search-web/backend";
import { WriterRef } from "@/types/server";
import { AppMessage } from "@/types/messages";

export const StreamingChat = gensx.Workflow(
  "StreamingChat",
  async ({ 
    chatId, 
    userId,
    messages,
    agent,
    memoriesPrompt,
    ragContext,
    writerRef,
  }: { 
    messages: AppMessage[],
    chatId: string, 
    userId: string, 
    agent: AgentData,
    memoriesPrompt: string,
    ragContext?: string,
    writerRef: WriterRef
  }) => {
    // https://s4.nanotrik.ai/attachments/2025-07-30/01K1EA90K28RZRKD6A19NNN8GE.pdf

    const result = streamText({
      system: SystemPrompt({
        memoriesPrompt: memoriesPrompt,
        agentSystemRole: agent.systemRole || "",
        ragContext: ragContext,
      }),
      messages: messages,
      // messages: [
      //   {
      //     role: 'user',
      //     content: [
      //       { type: 'text', text: 'What is the file about?' },
      //       // {
      //       //   type: 'file',
      //       //   mimeType: 'application/pdf',
      //       //   data: "https://s4.nanotrik.ai/attachments/2025-07-30/01K1EA90K28RZRKD6A19NNN8GE.pdf"
      //       // },
      //       {
      //         type: 'image',
      //         // mimeType: 'application/pdf',
      //         image: "https://s4.nanotrik.ai/attachments/2025-07-30/01K1EA90K28RZRKD6A19NNN8GE.pdf"
      //       },
      //     ],
      //   },
      // ],
      maxSteps: 5,
      toolCallStreaming: true,
      model: agent.chatModel,

      topP: agent.params?.top_p,
      temperature: agent.params?.temperature,
      presencePenalty: agent.params?.presence_penalty,
      frequencyPenalty: agent.params?.frequency_penalty,
      
      experimental_repairToolCall: async ({
        toolCall,
        tools,
        parameterSchema,
        error,
      }) => {
        if (NoSuchToolError.isInstance(error)) {
          return null; // do not attempt to fix invalid tool names
        }
    
        const tool = tools[toolCall.toolName as keyof typeof tools];
        const repairedArgs = await RepairArgs({
          parameters: tool.parameters,
          toolName: toolCall.toolName,
          args: toolCall.args,
          paramSchema: parameterSchema(toolCall),
        });
    
        return { ...toolCall, args: JSON.stringify(repairedArgs) };
      },
      onError: console.log,
      onFinish: createFinishHandler(chatId, userId),
      tools: {
        generateChatTitle: generateChatTitleTool(writerRef, chatId, userId), // dodelat aby se nerunovalo pokud uz existuje
        searchWeb: searchWebTool(),
      }
    });

    return result;
  },
);