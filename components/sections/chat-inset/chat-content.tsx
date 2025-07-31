import { useRef } from "react";

import { WelcomeScreen } from "@/components/sections/chat-inset/welcome/welcome-screen";
import { ConversationScreen } from "@/components/sections/chat-inset/conversation";

import { AppMessage } from "@/types/messages";

interface ChatContentProps {
  messages: AppMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  status: string;
  isDetailed: boolean;
  setIsDetailed: (value: boolean) => void;
  selectedAgent: string | null;
  onAgentSelect: (agentId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatContent({
  messages,
  input,
  handleInputChange,
  handleFormSubmit,
  status,
  isDetailed,
  setIsDetailed,
  selectedAgent,
  onAgentSelect,
  messagesEndRef
}: ChatContentProps) {
  return (
    <>
      {messages.length === 0 ? (
        <WelcomeScreen
          input={input}
          handleInputChange={handleInputChange}
          handleFormSubmit={handleFormSubmit}
          status={status}
          isDetailed={isDetailed}
          setIsDetailed={setIsDetailed}
          selectedAgent={selectedAgent}
          onAgentSelect={onAgentSelect}
        />
      ) : (
        <ConversationScreen
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleFormSubmit={handleFormSubmit}
          status={status}
          messagesEndRef={messagesEndRef}
        />
      )}
    </>
  );
} 