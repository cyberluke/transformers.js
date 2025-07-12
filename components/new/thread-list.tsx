'use client';

import { PlusIcon, MessageSquareIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThreadStore } from "@/lib/stores/thread-store";
import { cn } from "@/lib/utils";

export function ThreadList() {
  const { 
    threads, 
    currentThreadId, 
    createThread, 
    switchThread, 
    deleteThread 
  } = useThreadStore();

  const handleNewThread = () => {
    createThread();
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length > 1) {
      deleteThread(threadId);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Dnes';
    } else if (days === 1) {
      return 'Včera';
    } else if (days < 7) {
      return `Před ${days} dny`;
    } else {
      return date.toLocaleDateString('cs-CZ');
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-2 p-3">
      {/* New Thread Button */}
      <Button 
        onClick={handleNewThread}
        className="flex items-center justify-start gap-2 rounded-xl px-3 py-3 text-start bg-gradient-to-r from-gray-100/90 to-gray-200/80 backdrop-blur-sm border border-gray-300/50 hover:from-gray-200/90 hover:to-gray-300/80 hover:border-gray-400/60 transition-all duration-200 shadow-lg hover:shadow-xl text-gray-800 font-medium"
        variant="ghost"
      >
        <PlusIcon className="h-4 w-4" />
        Nový chat
      </Button>

      {/* Thread List */}
      <div className="space-y-2">
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => switchThread(thread.id)}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-3 cursor-pointer transition-all duration-200 border",
              currentThreadId === thread.id 
                ? "bg-gradient-to-r from-blue-500/80 to-blue-600/70 backdrop-blur-lg border-blue-400/60 shadow-lg shadow-blue-500/30 text-white" 
                : "bg-white/5 backdrop-blur-sm border-white/10 text-gray-800 hover:bg-white/10 hover:border-white/20 hover:text-gray-900 hover:shadow-lg"
            )}
          >
            <MessageSquareIcon className="h-4 w-4 flex-shrink-0 opacity-80" />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight">
                {thread.title}
              </p>
              <p className="text-xs opacity-70 mt-0.5">
                {thread.messages.length > 0 
                  ? `${thread.messages.length} zpráv`
                  : 'Prázdný'
                } • {formatDate(new Date(thread.updatedAt))}
              </p>
            </div>

            {/* Delete Button */}
            {threads.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 rounded-lg"
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
      </div>

      {threads.length === 0 && (
        <div className="text-sm text-gray-600 px-3 py-8 text-center bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          Žádné chaty zatím
        </div>
      )}
    </div>
  );
} 