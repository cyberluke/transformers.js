'use client';

import { useState, useRef } from 'react';
import { ArrowRightIcon, ZapIcon, LightbulbIcon } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip/";
import { AttachmentButton, AttachmentList } from "@/components/ui/attachment";
import { AgentSelector } from "./agent-selector";
import { useKeyBindings, commonKeyBindings } from "@/hooks/useKeyBindings";

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
  const [isAnimating, setIsAnimating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToggle = () => {
    setIsAnimating(true);
    setIsDetailed(!isDetailed);
    setTimeout(() => setIsAnimating(false), 200);
  };

  const handleSubmit = () => {
    if (status === 'ready' && input.trim()) {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      handleFormSubmit(event as unknown as React.FormEvent);
    }
  };

  // Klávesové zkratky
  useKeyBindings({
    bindings: [
      {
        key: 'Enter',
        action: handleSubmit,
        disabled: status !== 'ready' || !input.trim(),
        preventDefault: true,
        // Pouze Enter bez dalších modifikátorů
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false
      }
    ],
    target: textareaRef.current,
    deps: [status, input]
  });

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
        
        <h1 className="text-center font-medium text-shadow-emerald text-4xl md:text-5xl lg:text-6xl text-white">Co se chcete dozvědět?</h1>
        
        {/* Welcome Input */}
        <form onSubmit={handleFormSubmit} className="w-full flex flex-col rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 px-2.5 ease-in min-h-[64px] max-w-full overflow-hidden">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            rows={1}
            autoFocus
            placeholder="Ask anything..."
            disabled={status !== 'ready'}
            className="placeholder:text-white/60 text-white max-h-40 w-full flex-grow resize-none border-none bg-transparent px-2 py-4 text-lg outline-none focus:ring-0 disabled:cursor-not-allowed min-w-0 cursor-pointer"
            style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
          />
          <div className="flex w-full items-center justify-between pt-1 pb-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  aria-label={isDetailed ? "Složitější odpověď" : "Rychlá odpověď"} 
                  onClick={handleToggle} 
                  className="relative flex items-center w-13 h-7 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm transition-colors duration-200 overflow-hidden cursor-pointer"
                >
                  <span className="flex items-center justify-center w-1/2 h-full">
                    <ZapIcon className={`size-4 transition-colors duration-200 ${!isDetailed ? "text-yellow-400" : "text-white/50"}`} />
                  </span>
                  <span className="flex items-center justify-center w-1/2 h-full">
                    <LightbulbIcon className={`size-4 transition-colors duration-200 ${isDetailed ? "text-blue-400" : "text-white/50"}`} />
                  </span>
                  <span
                    className={`absolute top-1/2 left-[1px] w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm transition-transform duration-300 -translate-y-1/2
                      ${isAnimating ? "backdrop-blur-[1px]" : ""}
                      ${isDetailed ? "translate-x-6" : "translate-x-0"}`}
                    style={{ pointerEvents: "none" }}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                {isDetailed ? "Složitější odpověď" : "Rychlá jednoduchá odpověď"}
              </TooltipContent>
            </Tooltip>
            <div className="mx-1.5 flex gap-2">
              <AttachmentButton disabled={status !== 'ready'} />
              <button 
                type="submit"
                disabled={status !== 'ready' || !input.trim()}
                className="my-2.5 size-8 rounded-full p-1.5 transition-opacity duration-300 cursor-pointer bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 disabled:opacity-50 border border-white/30"
              >
                <ArrowRightIcon className="w-full h-full" />
              </button>
            </div>
          </div>
          
          {/* Attachment List */}
          <AttachmentList />
        </form>
        </div>
      </div>
    </div>
  );
} 