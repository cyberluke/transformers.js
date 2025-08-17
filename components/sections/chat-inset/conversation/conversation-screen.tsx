'use client';

import { MessageList } from "@/components/ui/message";
import { Composer } from "./composer";
import { GlassmorphicContainer } from "@/components/ui/containers";

import { AppMessage } from "@/types/messages";

interface ConversationScreenProps {
  messages: AppMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  status: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ConversationScreen({
  messages,
  input,
  handleInputChange,
  handleFormSubmit,
  status,
  messagesEndRef
}: ConversationScreenProps) {
  return (
    <div className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-transparent px-4 pt-8">
      <div className="w-full max-w-4xl">
        <MessageList status={status} />
      </div>
      <div className="min-h-8 flex-grow" />
      <div ref={messagesEndRef} />
      <Composer
        input={input}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
        status={status}
      />
    </div>
  );
} 