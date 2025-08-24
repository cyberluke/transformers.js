'use client';

import { PlusIcon, MessageSquareIcon, TrashIcon, RefreshCwIcon } from "lucide-react";
import { GlassmorphicButton } from "@/components/ui/buttons";
import { useThreads } from "@/hooks/useThreads";
import { cn } from "@/lib/utils";

export function ThreadList() {
  const { 
    threads, 
    currentThread,
    currentThreadId, 
    createThread, 
    switchThread, 
    deleteThread,
    hasNextPage,
    loadMoreThreads,
    isLoading 
  } = useThreads();



  const handleNewThread = () => {
    // Zkusí vytvořit nový thread (blokovaný pokud aktuální nemá serverChatId)
    createThread();
  };

  // Vizuální indikace zda lze vytvořit nový thread
  const canCreateNewThread = !currentThread || !!currentThread.serverChatId;

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
    <div className="flex flex-col items-stretch gap-2">
      {/* New Thread Button */}
      <GlassmorphicButton 
        onClick={handleNewThread}
        className={`flex items-center justify-start gap-2 rounded-xl px-3 py-4 text-start transition-all duration-200 ${
          canCreateNewThread 
            ? "" 
            : "opacity-50 cursor-not-allowed bg-white/5 text-white/50"
        }`}
        variant="secondary"
        size="lg"
        disabled={!canCreateNewThread}
        title={canCreateNewThread ? "Vytvořit nový chat" : "Nejdříve odešlete zprávu v aktuálním chatu"}
      >
        <PlusIcon className="h-4 w-4 flex-shrink-0" />
        <span>Nový chat</span>
      </GlassmorphicButton>

      {/* Thread List - skryté v collapsed módu */}
      <div className="space-y-2">
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => switchThread(thread.id)}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-4 cursor-pointer transition-all duration-300 border backdrop-blur-lg",
              currentThreadId === thread.id 
                ? "bg-white/10 border-emerald-400/50 shadow-lg shadow-emerald-500/20 text-white" 
                : "bg-white/10 border-white/20 text-white/90 hover:bg-white/20 hover:border-white/30 hover:text-white hover:shadow-lg"
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
              <GlassmorphicButton
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/30 hover:text-red-300 backdrop-blur-sm transition-all duration-200 rounded-lg border border-red-400/20 absolute right-3 top-1/2 -translate-y-1/2"
                onClick={(e) => handleDeleteThread(thread.id, e)}
              >
                <TrashIcon className="h-3 w-3" />
              </GlassmorphicButton>
            )}
            
            {/* Selected indicator */}
            {currentThreadId === thread.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-r-full" />
            )}
          </div>
        ))}

        {/* Load More Button */}
        {hasNextPage && (
          <GlassmorphicButton
            onClick={handleLoadMore}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-start disabled:opacity-50"
            variant="secondary"
          >
            <RefreshCwIcon className={cn("h-4 w-4 flex-shrink-0", isLoading && "animate-spin")} />
            <span>{isLoading ? 'Načítání...' : 'Načíst více'}</span>
          </GlassmorphicButton>
        )}
      </div>

      {threads.length === 0 && (
        <div className="text-sm text-white/80 px-3 py-8 text-center bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
          Zatím žádné chaty
        </div>
      )}
    </div>
  );
}

