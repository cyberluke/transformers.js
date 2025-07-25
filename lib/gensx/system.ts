
import * as gensx from "@gensx/core";
import { getBaseSystemPrompt } from "@/lib/api/chat/system-prompt";

export const SystemPrompt = gensx.Component(
  "SystemPrompt",
  ({ 
    memoriesPrompt,
    agentSystemRole,
  }: { 
    memoriesPrompt: string, 
    agentSystemRole: string,
  }) => {

    const systemPrompt = [getBaseSystemPrompt(), memoriesPrompt, agentSystemRole].filter(Boolean).join("\n");

    return systemPrompt;
  },
);