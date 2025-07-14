'use client';

import { SparkleIcon } from "lucide-react";
import { MarkdownRenderer } from './markdown-renderer';
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
        <div key={index} className="mb-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Spouštím krok...
          </div>
        </div>
      );
    
    case 'tool-invocation':
      return <ToolInvocation key={index} toolInvocation={part.toolInvocation} index={index} />;
    
    case 'text':
      return (
        <div key={index} className="prose prose-sm max-w-none">
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
    <div className="w-full max-w-[var(--thread-max-width)] space-y-4">
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'user' ? (
            /* User Message */
            <div className="relative w-full gap-y-2 py-4">
              <div className="text-foreground break-words rounded-3xl py-2.5 text-3xl">
                {/* Zpětná kompatibilita - pokud má parts, použij první text part, jinak content */}
                {message.parts 
                  ? message.parts.find(part => part.type === 'text')?.text || message.content
                  : message.content
                }
              </div>
            </div>
          ) : (
            /* Assistant Message */
            <div className="relative w-full py-4">
              <div className="text-foreground my-1.5 max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7">
                <h1 className="mb-4 inline-flex items-center gap-2 text-2xl">
                  <SparkleIcon /> Answer
                </h1>
                
                {/* Renderování parts nebo fallback na content */}
                {message.parts && message.parts.length > 0 ? (
                  <div className="space-y-2">
                    {message.parts.map((part, index) => renderMessagePart(part, index))}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <MarkdownRenderer content={message.content} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Loading State */}
      {(status === 'submitted') && (
        <div className="relative w-full py-4">
          <div className="text-foreground my-1.5 break-words leading-7">
            <h1 className="mb-4 inline-flex items-center gap-2 text-2xl">
              <SparkleIcon className="animate-pulse" /> Přemýšlím...
            </h1>
          </div>
        </div>
      )}
    </div>
  );
} 