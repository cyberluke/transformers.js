import { AgentData } from "@/types/agent";
import { openai } from "@ai-sdk/openai";

export const defaultAgent: AgentData = {
  id: "default-agent",
  title: "Default Agent",
  description: null,
  chatModel: openai('gpt-4o'),
  model: "gpt-4o",
  provider: "openai",
  params: null,
  systemRole: null,
  chatConfig: {
    searchMode: "on",
    historyCount: 10,
    enableReasoning: false,
  },
  openingMessage: null,
  openingQuestions: null,
  tts: null,
  originalId: null,
}