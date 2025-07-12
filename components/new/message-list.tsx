'use client';

import { SparkleIcon } from "lucide-react";
import { MarkdownRenderer } from './markdown-renderer';
import { useThreads } from '@/hooks/useThreads';

interface MessageListProps {
  status: string;
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
                {message.content}
              </div>
            </div>
          ) : (
            /* Assistant Message */
            <div className="relative w-full py-4">
              <div className="text-foreground my-1.5 max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7">
                <h1 className="mb-4 inline-flex items-center gap-2 text-2xl">
                  <SparkleIcon /> Answer
                </h1>
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={message.content} />
                </div>
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