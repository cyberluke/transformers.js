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
    <div className="flex flex-col items-stretch gap-1.5 p-2">
      {/* New Thread Button */}
      <Button 
        onClick={handleNewThread}
        className="flex items-center justify-start gap-2 rounded-lg px-2.5 py-2 text-start" 
        variant="ghost"
      >
        <PlusIcon className="h-4 w-4" />
        Nový chat
      </Button>

      {/* Thread List */}
      <div className="space-y-1">
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => switchThread(thread.id)}
            className={cn(
              "group flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-all",
              "hover:bg-white/5 hover:backdrop-blur-sm",
              currentThreadId === thread.id 
                ? "bg-white/10 backdrop-blur-sm border-l-4 border-blue-400 shadow-lg text-white" 
                : "text-muted-foreground"
            )}
          >
            <MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {thread.title}
              </p>
              <p className="text-xs opacity-70">
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
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => handleDeleteThread(thread.id, e)}
              >
                <TrashIcon className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {threads.length === 0 && (
        <div className="text-sm text-muted-foreground px-2.5 py-4 text-center">
          Žádné chaty zatím
        </div>
      )}
    </div>
  );
} 