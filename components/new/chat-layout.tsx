'use client';

import { useEffect, useRef } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { WelcomeScreen } from './welcome-screen';
import { MessageList } from './message-list';
import { Composer } from './composer';
import { useFingerprint } from '@/hooks/useFingerprint';
import { useThreads } from '@/hooks/useThreads';

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    console.log('messages', messages);
  }, [messages]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <p>Dev: {fingerprintData?.visitorId}</p>
          </div>
        </header>

        <div className="flex h-full w-full flex-col box-border" style={{ ["--thread-max-width" as string]: "42rem" }}>
          {/* Welcome Screen nebo Messages */}
          {JSON.stringify(messages)}
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
            /* Messages View */
            <div className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8">
              <MessageList status={status} />

              <div className="min-h-8 flex-grow" />
              <div ref={messagesEndRef} />

              <Composer
                input={input}
                handleInputChange={handleInputChange}
                handleFormSubmit={handleFormSubmit}
                status={status}
              />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 