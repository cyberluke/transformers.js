
import * as gensx from "@gensx/core";
import { getBaseSystemPrompt } from "@/lib/api/chat/system-prompt";

export const SystemPrompt = gensx.Component(
  "SystemPrompt",
  ({ 
    memoriesPrompt,
    agentSystemRole,
    ragContext,
  }: { 
    memoriesPrompt: string, 
    agentSystemRole: string,
    ragContext?: string,
  }) => {

    const systemPrompt = [getBaseSystemPrompt(), memoriesPrompt, agentSystemRole, ragContext].filter(Boolean).join("\n");

    return systemPrompt;
  },
);