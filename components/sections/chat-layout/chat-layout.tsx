'use client';

import { useEffect, useRef } from 'react';
import { SidebarProvider, AppSidebarContent } from "@/components/sections/sidebar";
import { useFingerprint } from '@/hooks/useFingerprint';
import { useThreads } from '@/hooks/useThreads';
import { SidebarInsetWrapper, ChatContent } from "@/components/sections";

interface ChatLayoutProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  status: string;
  isDetailed: boolean;
  setIsDetailed: (value: boolean) => void;
  selectedAgent: string | null;
  onAgentSelect: (agentId: string) => void;
}

export function ChatLayout({
  input,
  handleInputChange,
  handleFormSubmit,
  status,
  isDetailed,
  setIsDetailed,
  selectedAgent,
  onAgentSelect
}: ChatLayoutProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { fingerprintData } = useFingerprint();
  const { currentThread } = useThreads();
  const messages = currentThread?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    console.log("messages", messages);
  }, [messages]);

  return (
    <SidebarProvider>
      <AppSidebarContent />
      <SidebarInsetWrapper fingerprintData={fingerprintData}>
        <ChatContent
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleFormSubmit={handleFormSubmit}
          status={status}
          isDetailed={isDetailed}
          setIsDetailed={setIsDetailed}
          selectedAgent={selectedAgent}
          onAgentSelect={onAgentSelect}
          messagesEndRef={messagesEndRef}
        />
      </SidebarInsetWrapper>
    </SidebarProvider>
  );
} 