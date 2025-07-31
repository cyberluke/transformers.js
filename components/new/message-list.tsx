'use client';

import { SparkleIcon } from "lucide-react";
import { MarkdownRenderer } from '@/components/sections/chat-inset/conversation/markdown-renderer';
import { ToolInvocation } from './tool-invocation';
import { useThreads } from '@/hooks/useThreads';

interface MessageListProps {
  status: string;
}

// Funkce pro renderování jednotlivých částí zprávy
function renderMessagePart(part: any, index: number) {
  switch (part.type) {
    case 'step-start':
      return (
        <div key={index} className="mb-3">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            Spouštím krok...
          </div>
        </div>
      );
    
    case 'tool-invocation':
      return <ToolInvocation key={index} toolInvocation={part.toolInvocation} index={index} />;
    
    case 'text':
      return (
        <div key={index} className="prose prose-sm max-w-none prose-invert">
          <MarkdownRenderer content={part.text} />
        </div>
      );
    
    default:
      return null;
  }
}

export function MessageList({ status }: MessageListProps) {
  const { currentThread } = useThreads();
  const messages = currentThread?.messages || [];
  
  return (
    <div className="w-full space-y-6 px-4">
      {messages.map((message) => (
        <div key={message.id} className="w-full">
          {message.role === 'user' ? (
            /* User Message */
            <div className="flex w-full justify-end">
              <div className="max-w-[80%] bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl px-6 py-4 shadow-lg">
                <div className="text-white break-words text-lg font-medium">
                  {/* Zpětná kompatibilita - pokud má parts, použij první text part, jinak content */}
                  {message.parts 
                    ? message.parts.find(part => part.type === 'text')?.text || message.content
                    : message.content
                  }
                </div>
              </div>
            </div>
          ) : (
            /* Assistant Message */
            <div className="flex w-full justify-start">
              <div className="max-w-[90%] space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/30">
                    <SparkleIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Odpověď</h2>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                  {/* Renderování parts nebo fallback na content */}
                  {message.parts && message.parts.length > 0 ? (
                    <div className="space-y-4">
                      {message.parts.map((part, index) => renderMessagePart(part, index))}
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-invert">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Loading State */}
      {(status === 'submitted') && (
        <div className="flex w-full justify-start">
          <div className="max-w-[90%] space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/30">
                <SparkleIcon className="w-5 h-5 text-white animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold text-white">Přemýšlím...</h2>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 text-white/60">
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 