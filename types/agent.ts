import { openai } from "@ai-sdk/openai";

export interface AgentData {
  // Základní info
  id: string;
  title: string;
  description: string | null;
  
  // AI Model konfigurace
  chatModel: ReturnType<typeof openai>;
  model: string;
  provider: string;
  params: {
    temperature: number;
    top_p: number;
    presence_penalty: number;
    frequency_penalty: number;
    reasoning_effort?: string;
  } | null;
  
  // System prompt
  systemRole: string | null;
  
  // Chat konfigurace (jen vybrané)
  chatConfig: {
    searchMode: "off" | "on";
    historyCount: number;
    enableReasoning: boolean;
  };
  
  // Úvodní zprávy
  openingMessage: string | null;
  openingQuestions: string[] | null;
  
  // TTS
  tts: {
    voice: Record<string, string>;
    sttLocale: string;
    ttsService: string;
  } | null;
  
  // Original ID pro reference
  originalId: string | null;
}