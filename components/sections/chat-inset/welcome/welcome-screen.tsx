'use client';

import { AgentSelector } from "./welcome-screen/agent-selector";
import { WelcomeTitle, QueryForm } from "./welcome-screen/index";

interface WelcomeScreenProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  status: string;
  isDetailed: boolean;
  setIsDetailed: (value: boolean) => void;
  selectedAgent: string | null;
  onAgentSelect: (agentId: string) => void;
}

export function WelcomeScreen({ 
  input, 
  handleInputChange, 
  handleFormSubmit, 
  status, 
  isDetailed, 
  setIsDetailed,
  selectedAgent,
  onAgentSelect
}: WelcomeScreenProps) {

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-2xl flex-grow flex-col gap-20">
        {/* Agent Selection */}
        <div className="w-full">
          <AgentSelector 
            selectedAgent={selectedAgent}
            onAgentSelect={onAgentSelect}
            className="max-w-2xl mx-auto"
          />
        </div>

        <div className="w-full flex flex-col gap-10">
          <WelcomeTitle />
          <QueryForm
            input={input}
            status={status}
            handleInputChange={handleInputChange}
            handleFormSubmit={handleFormSubmit}
            isDetailed={isDetailed}
            setIsDetailed={setIsDetailed}
          />
        </div>
      </div>
    </div>
  );
} 