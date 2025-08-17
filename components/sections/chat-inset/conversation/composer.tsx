'use client';

import { ArrowRightIcon } from "lucide-react";
import { AttachmentButton, AttachmentList } from "@/components/ui/attachment";
import { GlassmorphicButton } from "@/components/ui/buttons";
import { GlassmorphicContainer } from "@/components/ui/containers";
import { useKeyBindings } from "@/hooks/useKeyBindings";
import { useRef } from "react";

interface ComposerProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  status: string;
}

export function Composer({ input, handleInputChange, handleFormSubmit, status }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = () => {
    if (status === 'ready' && input.trim()) {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      handleFormSubmit(event as unknown as React.FormEvent);
    }
  };

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
    <div className="sticky bottom-0 mt-3 flex w-full max-w-2xl flex-col items-center justify-end rounded-t-lg bg-transparent pb-4">
      <GlassmorphicContainer 
        variant="medium"
        className="w-full rounded-3xl hover:shadow-xl px-2.5 ease-in min-h-[64px] max-w-full overflow-hidden"
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            rows={1}
            placeholder="Ask follow-up"
            disabled={status !== 'ready'}
            className="placeholder:text-white/60 text-white max-h-40 w-full flex-grow resize-none border-none bg-transparent px-2 py-4 text-lg outline-none focus:ring-0 disabled:cursor-not-allowed min-w-0 cursor-pointer"
            style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
          />
          <div className="flex w-full items-center justify-between pt-1 pb-0">
            <div className="mx-1.5 flex items-center gap-4 ml-auto">
              <AttachmentButton disabled={status !== 'ready'} />
              <GlassmorphicButton 
                type="submit"
                disabled={status !== 'ready' || !input.trim()}
                size="icon-sm"
                className="my-2.5"
              >
                <ArrowRightIcon className="w-4 h-4" />
              </GlassmorphicButton>
            </div>
          </div>
          
          {/* Attachment List */}
          <AttachmentList />
        </form>
      </GlassmorphicContainer>
    </div>
  );
} 