'use client';

import { ArrowRightIcon, PaperclipIcon } from "lucide-react";

interface ComposerProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  status: string;
}

export function Composer({ input, handleInputChange, handleFormSubmit, status }: ComposerProps) {
  return (
    <div className="sticky bottom-0 mt-3 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-end rounded-t-lg bg-inherit pb-4">
      <form onSubmit={handleFormSubmit} className="focus-within:border-ring/20 w-full flex flex-col rounded-3xl bg-white backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-200 px-2.5 ease-in min-h-[64px] max-w-full overflow-hidden">
        <textarea
          value={input}
          onChange={handleInputChange}
          rows={1}
          placeholder="Ask follow-up"
          // disabled={status !== 'ready'}
          className="placeholder:text-muted-foreground max-h-40 w-full flex-grow resize-none border-none bg-transparent px-2 py-4 text-lg outline-none focus:ring-0 disabled:cursor-not-allowed min-w-0 cursor-pointer"
          style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
        />
        <div className="flex w-full items-center justify-between pt-1 pb-0">
          <div className="mx-1.5 flex gap-2 ml-auto">
            <button 
              type="button"
              className="rounded-max text-muted-foreground my-2.5 size-8 p-2 transition-opacity ease-in cursor-pointer hover:bg-accent"
            >
              <PaperclipIcon className="!size-4.5" />
            </button>
            <button 
              type="submit"
              disabled={status !== 'ready' || !input.trim()}
              className="my-2.5 size-8 rounded-full p-2 transition-opacity cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 