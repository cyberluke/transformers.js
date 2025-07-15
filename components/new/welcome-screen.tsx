'use client';

import { useState } from 'react';
import { ArrowRightIcon, ZapIcon, LightbulbIcon } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { AttachmentButton, AttachmentList } from "@/components/attachments";

interface WelcomeScreenProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  status: string;
  isDetailed: boolean;
  setIsDetailed: (value: boolean) => void;
}

export function WelcomeScreen({ 
  input, 
  handleInputChange, 
  handleFormSubmit, 
  status, 
  isDetailed, 
  setIsDetailed 
}: WelcomeScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setIsDetailed(!isDetailed);
    setTimeout(() => setIsAnimating(false), 200);
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col gap-12">
        <div className="flex w-full flex-grow flex-col items-center justify-center">
          <p className="font-regular font-display text-4xl md:text-5xl">Co se chcete dozvědět?</p>
        </div>
        
        {/* Welcome Input */}
        <form onSubmit={handleFormSubmit} className="focus-within:border-ring/20 w-full flex flex-col rounded-3xl bg-white backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-200 px-2.5 ease-in min-h-[64px] max-w-full overflow-hidden">
          <textarea
            value={input}
            onChange={handleInputChange}
            rows={1}
            autoFocus
            placeholder="Ask anything..."
            disabled={status !== 'ready'}
            className="placeholder:text-muted-foreground max-h-40 w-full flex-grow resize-none border-none bg-transparent px-2 py-4 text-lg outline-none focus:ring-0 disabled:cursor-not-allowed min-w-0 cursor-pointer"
            style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
          />
          <div className="flex w-full items-center justify-between pt-1 pb-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  aria-label={isDetailed ? "Složitější odpověď" : "Rychlá odpověď"} 
                  onClick={handleToggle} 
                  className="relative flex items-center w-13 h-7 rounded-full border border-gray-100 bg-white shadow-sm transition-colors duration-200 overflow-hidden cursor-pointer"
                >
                  <span className="flex items-center justify-center w-1/2 h-full">
                    <ZapIcon className={`size-4 transition-colors duration-200 ${!isDetailed ? "text-yellow-400" : "text-gray-300"}`} />
                  </span>
                  <span className="flex items-center justify-center w-1/2 h-full">
                    <LightbulbIcon className={`size-4 transition-colors duration-200 ${isDetailed ? "text-blue-400" : "text-gray-300"}`} />
                  </span>
                  <span
                    className={`absolute top-1/2 left-[1px] w-6 h-6 rounded-full border border-gray-200 shadow-sm transition-transform duration-300 -translate-y-1/2
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
                className="my-2.5 size-8 rounded-full p-2 transition-opacity cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <ArrowRightIcon />
              </button>
            </div>
          </div>
          
          {/* Attachment List */}
          <AttachmentList />
        </form>
      </div>
    </div>
  );
} 