'use client';

import { PlusIcon, MessageSquareIcon, TrashIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThreads } from "@/hooks/useThreads";
import { cn } from "@/lib/utils";
import { Thread } from "@/lib/services/threadService";
import { useState } from "react";

export function ThreadList() {
  const { 
    threads, 
    currentThreadId, 
    createThread, 
    switchThread, 
    deleteThread,
    hasNextPage,
    loadMoreThreads,
    isLoading 
  } = useThreads();



  const handleNewThread = () => {
    createThread();
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length > 1) {
      deleteThread(threadId);
    }
  };

  const handleLoadMore = async () => {
    if (!hasNextPage || isLoading) return;
    
    try {
      await loadMoreThreads();
    } catch (error) {
      console.error('Error loading more threads:', error);
    }
  };



  return (
    <div className="flex flex-col items-stretch gap-2 p-3">
      {/* New Thread Button */}
      <Button 
        onClick={handleNewThread}
        className="flex items-center justify-start gap-2 rounded-xl px-3 py-4 text-start bg-black/30 backdrop-blur-lg border border-white/20 hover:bg-black/40 hover:border-white/30 transition-all duration-200 shadow-lg hover:shadow-xl text-white font-medium group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
        variant="ghost"
      >
        <PlusIcon className="h-4 w-4 flex-shrink-0" />
        <span className="group-data-[collapsible=icon]:hidden">Nový chat</span>
      </Button>

      {/* Thread List - skryté v collapsed módu */}
      <div className="space-y-2 group-data-[collapsible=icon]:hidden">
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => switchThread(thread.id)}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-3 cursor-pointer transition-all duration-200 border",
              currentThreadId === thread.id 
                ? "bg-gradient-to-r from-blue-500/80 to-blue-600/70 backdrop-blur-lg border-blue-400/60 shadow-lg shadow-blue-500/30 text-white" 
                : "bg-black/20 backdrop-blur-lg border-white/15 text-white/90 hover:bg-black/30 hover:border-white/25 hover:text-white hover:shadow-lg"
            )}
          >
            <MessageSquareIcon className="h-4 w-4 flex-shrink-0 opacity-80" />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight">
                {thread.title}
              </p>
            </div>

            {/* Delete Button */}
            {threads.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/30 hover:text-red-300 backdrop-blur-sm transition-all duration-200 rounded-lg border border-red-400/20"
                onClick={(e) => handleDeleteThread(thread.id, e)}
              >
                <TrashIcon className="h-3 w-3" />
              </Button>
            )}
            
            {/* Selected indicator */}
            {currentThreadId === thread.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full" />
            )}
          </div>
        ))}

        {/* Load More Button */}
        {hasNextPage && (
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-start bg-black/30 backdrop-blur-lg border border-white/20 hover:bg-black/40 hover:border-white/30 transition-all duration-200 shadow-lg hover:shadow-xl text-white font-medium disabled:opacity-50 group-data-[collapsible=icon]:px-2"
            variant="ghost"
          >
            <RefreshCwIcon className={cn("h-4 w-4 flex-shrink-0", isLoading && "animate-spin")} />
            <span className="group-data-[collapsible=icon]:hidden">{isLoading ? 'Načítání...' : 'Načíst více'}</span>
          </Button>
        )}
      </div>

      {threads.length === 0 && (
        <div className="text-sm text-white/80 px-3 py-8 text-center bg-black/20 backdrop-blur-lg rounded-xl border border-white/15 group-data-[collapsible=icon]:hidden">
          Žádné chaty zatím
        </div>
      )}
    </div>
  );
}

