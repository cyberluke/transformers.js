
import * as gensx from "@gensx/core";
import { retrieveMemories } from "@/lib/server/mem0/mem0-utils";
import { SYSTEM_HIGHLIGHT_PROMPT } from "../server/mem0/prompt";
import { AppMessage } from "@/types/messages";

export const Memories = gensx.Component(
  "Memories",
  async ({ 
    messages, 
    userId,
  }: { 
    messages: AppMessage[], 
    userId: string, 
  }) => {
    const config = {
      user_id: userId!,
      rerank: true,
      threshold: 0.1,
      output_format: "v1.0",
      enable_graph: true
    }

    const {memories, systemMessage} = await retrieveMemories(messages, config);
    const prompt = [SYSTEM_HIGHLIGHT_PROMPT, systemMessage].filter(Boolean).join("\n");

    return {
      memories,
      prompt,
    };
  },
);