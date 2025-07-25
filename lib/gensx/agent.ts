import * as gensx from "@gensx/core";
import { agents } from "@/lib/agents";

export const SelectAgent = gensx.Component(
  "SelectAgent",
  ({ 
    agentId,
  }: { 
    agentId: string,
  }) => {
    const agent = agents.find((agent) => agent.id === agentId);

    return agent;
  },
);